import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import vm from "node:vm";

const source = readFileSync(new URL("../sw.js", import.meta.url), "utf8");
const clientSource = readFileSync(new URL("../notifications.js", import.meta.url), "utf8");

function serviceWorkerFixture({ scope = "https://liminal.example/", databaseFailure = false, windows = [] } = {}) {
  const handlers = new Map();
  const stores = new Map();
  const notifications = [];
  const opened = [];
  const database = {
    objectStoreNames: { contains: name => stores.has(name) },
    createObjectStore(name) { stores.set(name, new Map()); },
    close() {},
    transaction(name) {
      const entries = stores.get(name);
      const transaction = {
        objectStore: () => ({
          put(value) { entries.set(value.eventId, structuredClone(value)); },
          delete(key) { entries.delete(key); },
          getAll() {
            const request = { result: [...entries.values()] };
            queueMicrotask(() => request.onsuccess());
            return request;
          }
        })
      };
      setTimeout(() => transaction.oncomplete(), 0);
      return transaction;
    }
  };
  const indexedDB = { open() {
    const request = { result: database, error: new Error("storage unavailable") };
    queueMicrotask(() => {
      if (databaseFailure) request.onerror();
      else {
        request.onupgradeneeded();
        request.onsuccess();
      }
    });
    return request;
  } };
  const self = {
    registration: { scope, async showNotification(title, options) { notifications.push({ title, options }); } },
    clients: { matchAll: async () => windows, openWindow: async url => { opened.push(url); } },
    addEventListener: (name, callback) => handlers.set(name, callback)
  };
  vm.runInNewContext(source, { self, indexedDB, URL, Date, Promise, Error });
  async function event(name, value) {
    let pending;
    handlers.get(name)({ ...value, waitUntil: promise => { pending = promise; } });
    await pending;
  }
  return { handlers, stores, notifications, opened, event };
}

const testPayload = {
  version: 1, kind: "test", eventId: "test-event-1", personId: "jasper",
  // These untrusted display/path fields should not be used by the worker.
  title: "external title", body: "untrusted text", url: "https://evil.example/"
};

test("notification worker has no fetch listener or runtime cache", () => {
  const f = serviceWorkerFixture();
  assert.deepEqual([...f.handlers.keys()], ["push", "notificationclick"]);
  assert(!/\bcaches\s*\./.test(source));
  assert(!/localStorage/.test(source));
});

test("test push shows a notification and writes only a bounded test receipt, not chat/message content", async () => {
  const posted = [];
  const f = serviceWorkerFixture({ windows: [{ postMessage: value => posted.push(value) }] });
  await f.event("push", { data: { json: () => testPayload } });
  assert.equal(f.notifications.length, 1);
  assert.equal(f.notifications[0].title, "Liminal · 测试通知");
  assert.equal(f.notifications[0].options.data.url, "https://liminal.example/chat.html?person=jasper");
  assert.equal(f.stores.get("messages").size, 0);
  assert.equal(f.stores.get("testReceipts").size, 1);
  assert.equal(posted[0].type, "liminal-push-test-received");
  await f.event("push", { data: { json: () => testPayload } });
  assert.equal(f.stores.get("testReceipts").size, 1, "retry uses the same receipt ID");
  assert.equal(f.notifications[0].options.tag, f.notifications[1].options.tag, "retry replaces the same notification");
  for (let index = 0; index < 35; index += 1) {
    await f.event("push", { data: { json: () => ({ ...testPayload, eventId: `test-${index}` }) } });
  }
  assert.equal(f.stores.get("testReceipts").size, 30);
  assert.equal(f.stores.get("messages").size, 0);
});

test("malformed push and IndexedDB failure still result in a visible notification", async () => {
  const f = serviceWorkerFixture({ databaseFailure: true });
  await f.event("push", { data: { json: () => testPayload } });
  await f.event("push", { data: { json: () => { throw new Error("invalid JSON"); } } });
  await f.event("push", { data: null });
  assert.equal(f.notifications.length, 3);
});

test("notification clicks open corresponding Chat in root or /liminal/ scope", async () => {
  for (const scope of ["https://liminal.example/", "https://keshiilu.github.io/liminal/"]) {
    const f = serviceWorkerFixture({ scope });
    await f.event("push", { data: { json: () => testPayload } });
    let closed = false;
    await f.event("notificationclick", { notification: {
      data: f.notifications[0].options.data, close: () => { closed = true; }
    } });
    assert(closed);
    assert.equal(f.opened[0], new URL("chat.html?person=jasper", scope).href);
    await f.event("notificationclick", { notification: { data: { url: "https://evil.example/" }, close() {} } });
    assert.equal(f.opened.length, 1, "foreign origin must never open");
  }
});

test("click focuses an existing matching Chat or navigates an existing app window", async () => {
  let focused = 0;
  const exact = { url: "https://liminal.example/chat.html?person=jasper", focus: async () => { focused += 1; } };
  const f = serviceWorkerFixture({ windows: [exact] });
  await f.event("notificationclick", { notification: { data: { url: exact.url }, close() {} } });
  assert.equal(focused, 1);
  assert.equal(f.opened.length, 0);
  let destination;
  const g = serviceWorkerFixture({ windows: [{ url: "https://liminal.example/settings.html",
    navigate: async url => { destination = url; return exact; } }] });
  await g.event("notificationclick", { notification: { data: { url: exact.url }, close() {} } });
  assert.equal(destination, exact.url);
  assert.equal(g.opened.length, 0);
});

test("a project-scoped notification never navigates another app on the same origin", async () => {
  const scope = "https://keshiilu.github.io/liminal/";
  let navigated = false;
  const f = serviceWorkerFixture({ scope, windows: [{ url: "https://keshiilu.github.io/another-project/",
    navigate: async () => { navigated = true; } }] });
  const url = new URL("chat.html?person=luzhen", scope).href;
  await f.event("notificationclick", { notification: { data: { url }, close() {} } });
  assert(!navigated);
  assert.deepEqual(f.opened, [url]);
});

function pageFixture({ ios = true, standalone = true, serverFailure = false, subscribeFailure = false } = {}) {
  const ids = ["pushStatus", "testStatus", "enablePush", "disablePush", "testPushNow", "testPushLater", "testPerson", "currentOrigin"];
  const elements = new Map(ids.map(id => [id, { textContent: "", disabled: true, dataset: {}, value: "luzhen",
    handlers: new Map(), addEventListener(name, callback) { this.handlers.set(name, callback); } }]));
  let permissionCalls = 0;
  let registrationCalls = 0;
  let subscription = null;
  let enabled = false;
  const apiCalls = [];
  const publicKey = Buffer.from([4, ...new Array(64).fill(1)]).toString("base64url");
  const registration = {
    active: true, pushManager: {
      getSubscription: async () => subscription,
      subscribe: async options => {
        subscription = { options, toJSON: () => ({ endpoint: "https://web.push.apple.com/test", keys: {} }),
          unsubscribe: async () => { subscription = null; return true; } };
        return subscription;
      }
    }
  };
  const notification = { permission: "default", requestPermission: async () => {
    permissionCalls += 1; notification.permission = "granted"; return "granted";
  } };
  const window = { addEventListener() {}, PushManager: function () {}, Notification: notification };
  const navigator = {
    userAgent: ios ? "iPhone" : "Chrome", standalone, platform: ios ? "iPhone" : "Win32", maxTouchPoints: 1,
    serviceWorker: { register: async () => { registrationCalls += 1; return registration; },
      getRegistration: async () => registration, addEventListener() {} }
  };
  const sandbox = {
    window, navigator, Notification: notification, isSecureContext: true, URL, Date, Promise, Error,
    Uint8Array, atob, btoa, location: { origin: "https://liminal.example" },
    matchMedia: () => ({ matches: standalone }), setTimeout: () => 1, clearTimeout() {},
    document: { baseURI: "https://liminal.example/notifications.html", hidden: false,
      getElementById: id => elements.get(id), addEventListener() {} },
    fetch: async (url, options) => {
      const action = new URL(url).pathname.split("/").at(-1);
      apiCalls.push({ action, options });
      if (serverFailure) return new Response("not a Worker", { status: 404 });
      if (action === "config") return Response.json({ publicKey, enabled, lastTest: null });
      if (action === "subscribe") {
        if (subscribeFailure) return Response.json({ error: "保存订阅失败" }, { status: 503 });
        enabled = true;
        return Response.json({ enabled });
      }
      if (action === "unsubscribe") { enabled = false; return Response.json({ enabled }); }
      if (action === "test") return Response.json({ lastTest: { state: "queued" } }, { status: 202 });
      throw new Error("unexpected API");
    }
  };
  vm.runInNewContext(clientSource, sandbox);
  const settle = () => new Promise(resolve => setImmediate(resolve));
  async function click(id) { await elements.get(id).handlers.get("click")(); await settle(); }
  return { elements, apiCalls, settle, click, counts: () => ({ permissionCalls, registrationCalls }),
    subscribed: () => Boolean(subscription) };
}

test("opening notification settings checks status but never requests permission or registers a worker", async () => {
  const f = pageFixture();
  await f.settle();
  assert.deepEqual(f.counts(), { permissionCalls: 0, registrationCalls: 0 });
  assert.equal(f.elements.get("enablePush").disabled, false);
  await f.click("enablePush");
  assert.deepEqual(f.counts(), { permissionCalls: 1, registrationCalls: 1 });
  assert(f.subscribed());
  assert.equal(f.elements.get("testPushLater").disabled, false);
  await f.click("testPushLater");
  const testRequest = f.apiCalls.find(value => value.action === "test");
  assert.deepEqual(JSON.parse(testRequest.options.body), { personId: "luzhen", delaySeconds: 20 });
  assert.equal(testRequest.options.credentials, "same-origin");
  await f.click("disablePush");
  assert(!f.subscribed());
  assert.equal(f.elements.get("testPushLater").disabled, true);
});

test("iPhone Safari outside Home Screen and a Pages origin cannot request permission", async () => {
  for (const options of [{ standalone: false }, { serverFailure: true }]) {
    const f = pageFixture(options);
    await f.settle();
    assert.equal(f.elements.get("enablePush").disabled, true);
    await f.click("enablePush");
    assert.deepEqual(f.counts(), { permissionCalls: 0, registrationCalls: 0 });
  }
});

test("failed subscription save cleans up the newly created browser subscription", async () => {
  const f = pageFixture({ subscribeFailure: true });
  await f.settle();
  await f.click("enablePush");
  assert(!f.subscribed());
  assert.equal(f.elements.get("pushStatus").dataset.error, "true");
  assert.equal(f.elements.get("enablePush").disabled, false);
});

test("deployment JSONC and notification HTML references are valid, without changing PWA scope", () => {
  const root = new URL("../", import.meta.url);
  const config = JSON.parse(readFileSync(new URL("wrangler.jsonc", root), "utf8").replace(/^\s*\/\/.*$/gm, ""));
  assert.equal(config.main, "worker/index.js");
  assert.deepEqual(config.assets, { directory: ".", binding: "ASSETS", run_worker_first: true,
    html_handling: "none", not_found_handling: "none" });
  assert.deepEqual(config.secrets.required, ["LIMINAL_ACCESS_PASSWORD", "LIMINAL_SESSION_SECRET"]);
  assert.deepEqual(config.durable_objects.bindings, [{ name: "PUSH_DEVICES", class_name: "LiminalPushDevice" }]);
  const manifest = JSON.parse(readFileSync(new URL("manifest.webmanifest", root), "utf8"));
  assert.equal(manifest.start_url, "./");
  assert.equal(manifest.scope, "./");
  assert.equal(manifest.display, "standalone");
  for (const file of ["notifications.html", "settings.html"]) {
    const html = readFileSync(new URL(file, root), "utf8");
    const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
    assert.equal(new Set(ids).size, ids.length, `${file} duplicate ID`);
    assert.equal([...html.matchAll(/rel="manifest"/g)].length, 1);
    assert.equal([...html.matchAll(/name="viewport"/g)].length, 1);
    assert(html.includes("width=device-width, initial-scale=1, viewport-fit=cover"));
    for (const match of html.matchAll(/\b(?:src|href)="([^"]+)"/g)) {
      const path = match[1];
      if (/^(?:[a-z]+:|#)/i.test(path)) continue;
      assert(!path.startsWith("/"), `${file} root-relative asset ${path}`);
      assert(existsSync(new URL(path.split(/[?#]/)[0], root)), `${file} missing ${path}`);
    }
  }
  for (const icon of manifest.icons) assert(existsSync(new URL(icon.src, root)));
  assert(existsSync(new URL("icons/liminal-icon-192.png", root)));
  const settings = readFileSync(new URL("settings.html", root), "utf8");
  assert(/<a[^>]+href="notifications.html"/.test(settings));
  const ignore = readFileSync(new URL(".assetsignore", root), "utf8");
  for (const path of ["worker/", ".dev.vars*", ".env*", ".wrangler/", "WEB-PUSH-SETUP.md"]) {
    assert(ignore.split(/\r?\n/).includes(path));
  }
  assert(!ignore.split(/\r?\n/).includes("sw.js"));
  assert(!/localStorage|sessionStorage/.test(clientSource));
});
