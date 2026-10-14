import { test } from "node:test";
import assert from "node:assert/strict";
import { createECDH, createHmac, createDecipheriv, createPublicKey, verify } from "node:crypto";
import worker, { createSessionToken } from "./index.js";
import { LiminalPushDevice } from "./push-device.js";
import { encodeBase64Url, decodeBase64Url, publicKeyJwk, encryptPushPayload,
  validateSubscription, readVapidConfig } from "./web-push.js";

const origin = "https://liminal.example";
const sessionSecret = "ephemeral-unit-test-session-secret";
const vapidPair = await crypto.subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, true, ["sign", "verify"]);
const vapidJwk = await crypto.subtle.exportKey("jwk", vapidPair.privateKey);
const publicBytes = await crypto.subtle.exportKey("raw", vapidPair.publicKey);
const browserEcdh = createECDH("prime256v1");
browserEcdh.generateKeys();
const auth = crypto.getRandomValues(new Uint8Array(16));
const subscription = {
  endpoint: "https://web.push.apple.com/Qtest-device",
  keys: { p256dh: encodeBase64Url(browserEcdh.getPublicKey()), auth: encodeBase64Url(auth) }
};

class MemoryStorage {
  values = new Map();
  alarm = null;
  async get(key) { return structuredClone(this.values.get(key)); }
  async put(key, value) { this.values.set(key, structuredClone(value)); }
  async delete(keys) { for (const key of Array.isArray(keys) ? keys : [keys]) this.values.delete(key); }
  async setAlarm(timestamp) { this.alarm = timestamp; }
  async deleteAlarm() { this.alarm = null; }
}

async function fixture() {
  const objects = new Map();
  const env = {
    LIMINAL_ACCESS_PASSWORD: "ephemeral-test-password", LIMINAL_SESSION_SECRET: sessionSecret,
    LIMINAL_VAPID_PUBLIC_KEY: encodeBase64Url(publicBytes), LIMINAL_VAPID_PRIVATE_KEY: vapidJwk.d,
    LIMINAL_VAPID_SUBJECT: "mailto:maintainer@example.com",
    ASSETS: { fetch: async () => new Response("protected test asset") }
  };
  env.PUSH_DEVICES = {
    idFromName: name => name,
    get(id) {
      if (!objects.has(id)) {
        const storage = new MemoryStorage();
        let chain = Promise.resolve();
        const ctx = { storage, blockConcurrencyWhile(callback) {
          const next = chain.then(callback);
          chain = next.catch(() => {});
          return next;
        } };
        objects.set(id, new LiminalPushDevice(ctx, env));
      }
      return objects.get(id);
    }
  };
  let cookie = `__Host-liminal_session=${await createSessionToken(sessionSecret)}`;
  const request = (action, input = {}, overrides = {}) => new Request(`${origin}/__liminal/push/${action}`, {
    method: "POST", headers: { Origin: origin, "Content-Type": "application/json", "X-Liminal-Push": "1",
      Cookie: cookie, ...overrides }, body: JSON.stringify(input)
  });
  async function api(action, input, overrides) {
    const response = await worker.fetch(request(action, input, overrides), env);
    const added = response.headers.get("Set-Cookie");
    if (added) cookie += `; ${added.split(";", 1)[0]}`;
    return response;
  }
  async function enable() {
    assert.equal((await api("config")).status, 200);
    assert.equal((await api("subscribe", { subscription })).status, 200);
  }
  const object = () => [...objects.values()][0];
  return { env, api, enable, object, objects, request, cookie: () => cookie };
}

function decryptIndependently(body) {
  const buffer = Buffer.from(body);
  const salt = buffer.subarray(0, 16);
  assert.equal(buffer.readUInt32BE(16), 4096);
  assert.equal(buffer[20], 65);
  const sender = buffer.subarray(21, 86);
  const shared = browserEcdh.computeSecret(sender);
  const hmac = (key, input) => createHmac("sha256", key).update(input).digest();
  const ikm = hmac(hmac(auth, shared), Buffer.concat([
    Buffer.from("WebPush: info\0"), browserEcdh.getPublicKey(), sender, Buffer.from([1])
  ]));
  const prk = hmac(salt, ikm);
  const cek = hmac(prk, Buffer.from("Content-Encoding: aes128gcm\0\x01")).subarray(0, 16);
  const nonce = hmac(prk, Buffer.from("Content-Encoding: nonce\0\x01")).subarray(0, 12);
  const encrypted = buffer.subarray(86);
  const decipher = createDecipheriv("aes-128-gcm", cek, nonce);
  decipher.setAuthTag(encrypted.subarray(-16));
  const plaintext = Buffer.concat([decipher.update(encrypted.subarray(0, -16)), decipher.final()]);
  assert.equal(plaintext.at(-1), 2);
  return JSON.parse(plaintext.subarray(0, -1).toString());
}

async function withProvider(callback, providerStatus = 201) {
  const original = globalThis.fetch;
  const requests = [];
  globalThis.fetch = async (url, options) => {
    requests.push({ url, options });
    assert.equal(url, subscription.endpoint);
    return new Response(null, { status: providerStatus });
  };
  try { await callback(requests); } finally { globalThis.fetch = original; }
}

test("RFC 8291 known-answer encryption vector matches the published bytes", async () => {
  // Public RFC example keys, never production credentials.
  const sender = "BP4z9KsN6nGRTbVYI_c7VJSPQTBtkgcy27mlmlMoZIIgDll6e3vCYLocInmYWAmS6TlzAC8wEqKK6PBru3jl7A8";
  const receiver = "BCVxsr7N_eNgVRqvHtD0zTZsEc6-VV-JvLexhqUzORcxaOzi6-AYWXvTBHm4bjyPjs7Vd8pZGH6SRpkNtoIAiw4";
  const publicKey = await crypto.subtle.importKey("raw", decodeBase64Url(sender),
    { name: "ECDH", namedCurve: "P-256" }, true, []);
  const privateKey = await crypto.subtle.importKey("jwk", {
    ...publicKeyJwk(decodeBase64Url(sender)), d: "yfWPiYE-n46HLnH0KqZOF1fJJU3MYrct3AELtAQ-oRw"
  }, { name: "ECDH", namedCurve: "P-256" }, false, ["deriveBits"]);
  const encrypted = await encryptPushPayload({ keys: { p256dh: receiver, auth: "BTBZMqHH6r4Tts7J_aSIgg" } },
    "When I grow up, I want to be a watermelon", {
      keyPair: { publicKey, privateKey }, salt: decodeBase64Url("DGv6ra1nlYgDCS1FRnbzlw")
    });
  assert.equal(encodeBase64Url(encrypted),
    "DGv6ra1nlYgDCS1FRnbzlwAAEABBBP4z9KsN6nGRTbVYI_c7VJSPQTBtkgcy27mlmlMoZIIgDll6e3vCYLocInmYWAmS6TlzAC8wEqKK6PBru3jl7A_yl95bQpu6cVPTpK4Mqgkf1CXztLVBSt2Ks3oZwbuwXPXLWyouBWLVWGNWQexSgSxsj_Qulcy4a-fN");
});

test("unauthenticated, tampered and expired sessions cannot trigger a test", async () => {
  const f = await fixture();
  for (const cookie of ["", "__Host-liminal_session=invalid",
    `__Host-liminal_session=${await createSessionToken(sessionSecret, Math.floor(Date.now() / 1000) - 120, 60)}`]) {
    const response = await f.api("test", { personId: "luzhen", delaySeconds: 0 }, { Cookie: cookie });
    assert.equal(response.status, 401);
  }
  assert.equal(f.objects.size, 0);
});

test("all API operations enforce same-origin JSON POST; no CORS trigger is exposed", async () => {
  const f = await fixture();
  for (const action of ["config", "subscribe", "unsubscribe", "test"]) {
    for (const headers of [{ Origin: "https://evil.example" }, { Origin: "null" }, { Origin: "" },
      { "X-Liminal-Push": "" }, { "Content-Type": "text/plain" }]) {
      const response = await f.api(action, {}, headers);
      assert.equal(response.status, 403);
      assert.equal(response.headers.get("Access-Control-Allow-Origin"), null);
    }
    const get = await worker.fetch(new Request(`${origin}/__liminal/push/${action}`, {
      headers: { Cookie: f.cookie() }
    }), f.env);
    assert.equal(get.status, 405);
  }
});

test("missing push configuration fails closed for APIs but preserves original asset authentication", async () => {
  const f = await fixture();
  delete f.env.LIMINAL_VAPID_PRIVATE_KEY;
  const response = await f.api("config");
  assert.equal(response.status, 503);
  assert.equal((await worker.fetch(new Request(`${origin}/sw.js`), f.env)).status, 401);
  assert.equal((await worker.fetch(new Request(`${origin}/sw.js`, { headers: { Cookie: f.cookie() } }), f.env)).status, 200);
  delete f.env.LIMINAL_SESSION_SECRET;
  assert.equal((await f.api("test")).status, 503);
});

test("configuration exports only the public key and issues a secure signed device cookie", async () => {
  const f = await fixture();
  const response = await f.api("config");
  const text = await response.text();
  assert.equal(response.status, 200);
  assert.equal(JSON.parse(text).publicKey, f.env.LIMINAL_VAPID_PUBLIC_KEY);
  assert(!text.includes(vapidJwk.d));
  assert(!text.includes(sessionSecret));
  const cookie = response.headers.get("Set-Cookie");
  for (const attribute of ["__Host-liminal_push_device=", "Path=/", "HttpOnly", "Secure", "SameSite=Strict"]) {
    assert(cookie.includes(attribute));
  }
  assert.equal(response.headers.get("Cache-Control"), "private, no-store, max-age=0");
});

test("invalid subscriptions and arbitrary outbound endpoints never enter persistent storage", async () => {
  const f = await fixture();
  await f.api("config");
  for (const endpoint of ["http://web.push.apple.com/test", "https://127.0.0.1/test", "https://evil.example/test",
    "https://push.apple.com.evil.example/test", "https://user:password@web.push.apple.com/test",
    "https://web.push.apple.com:8443/test"]) {
    assert.equal((await f.api("subscribe", { subscription: { ...subscription, endpoint } })).status, 400);
  }
  assert.equal((await f.api("subscribe", { subscription: { ...subscription, keys: { ...subscription.keys, auth: "AA" } } })).status, 400);
  assert.equal((await f.api("subscribe", { subscription: { ...subscription, keys: { ...subscription.keys, p256dh: "AA" } } })).status, 400);
  assert.equal(await f.object().storage.get("subscription"), undefined);
  await assert.rejects(validateSubscription({ ...subscription, keys: { ...subscription.keys, p256dh: encodeBase64Url(new Uint8Array(65)) } }));
});

test("test is fixed content, limited to two people/delays, and cannot target an arbitrary device", async () => {
  const f = await fixture();
  await f.enable();
  for (const input of [{ personId: "unknown", delaySeconds: 0 }, { personId: "luzhen", delaySeconds: 5 }]) {
    assert.equal((await f.api("test", input)).status, 400);
  }
  const tampered = f.cookie().replace(/(__Host-liminal_push_device=)[^;]+/, "$1forged.token");
  assert.equal((await f.api("test", { personId: "luzhen", delaySeconds: 0 }, { Cookie: tampered })).status, 409);
  assert.equal(await f.object().storage.get("pendingTest"), undefined);
});

test("immediate push is encrypted, VAPID signature is valid, and the payload points to corresponding Chat", async () => {
  const f = await fixture();
  await f.enable();
  await withProvider(async requests => {
    const response = await f.api("test", { personId: "jasper", delaySeconds: 0 });
    assert.equal(response.status, 200);
    assert.equal((await response.json()).lastTest.state, "accepted");
    assert.equal(requests.length, 1);
    const { options } = requests[0];
    assert.equal(options.headers["Content-Encoding"], "aes128gcm");
    assert.equal(options.redirect, "error");
    const payload = decryptIndependently(options.body);
    assert.equal(payload.kind, "test");
    assert.equal(payload.personId, "jasper");
    assert.equal(payload.url, `${origin}/chat.html?person=jasper`);
    assert(!Buffer.from(options.body).includes(Buffer.from(payload.body)));
    const match = options.headers.Authorization.match(/^vapid t=(.+), k=(.+)$/);
    assert(match);
    assert.equal(match[2], f.env.LIMINAL_VAPID_PUBLIC_KEY);
    const [header, claims, signature] = match[1].split(".");
    assert.equal(JSON.parse(Buffer.from(header, "base64url")).alg, "ES256");
    const parsed = JSON.parse(Buffer.from(claims, "base64url"));
    assert.equal(parsed.aud, "https://web.push.apple.com");
    assert.equal(parsed.sub, f.env.LIMINAL_VAPID_SUBJECT);
    assert(parsed.exp > Date.now() / 1000 && parsed.exp < Date.now() / 1000 + 86400);
    assert(verify("sha256", Buffer.from(`${header}.${claims}`), {
      key: createPublicKey({ key: await crypto.subtle.exportKey("jwk", vapidPair.publicKey), format: "jwk" }),
      dsaEncoding: "ieee-p1363"
    }, Buffer.from(signature, "base64url")));
    assert.notEqual(encodeBase64Url(options.body.slice(21, 86)), f.env.LIMINAL_VAPID_PUBLIC_KEY);
    await f.object().alarm();
    assert.equal(requests.length, 1, "a repeated alarm must not resend an already accepted job");
  });
});

test("20-second test is a persistent alarm; closing the page is not needed to complete it", async () => {
  const f = await fixture();
  await f.enable();
  await withProvider(async requests => {
    const start = Date.now();
    assert.equal((await f.api("test", { personId: "luzhen", delaySeconds: 20 })).status, 202);
    assert(f.object().storage.alarm >= start + 20000);
    assert.equal(requests.length, 0);
    assert.equal((await f.api("test", { personId: "luzhen", delaySeconds: 20 })).status, 429);
    await f.object().alarm();
    assert.equal(requests.length, 0, "an early alarm must not send before the due time");
    const job = await f.object().storage.get("pendingTest");
    await f.object().storage.put("pendingTest", { ...job, dueAt: Date.now() - 1 });
    // Recreate the object with the same persistent storage to simulate a cold start.
    const cold = new LiminalPushDevice(f.object().ctx, f.env);
    await cold.alarm();
    assert.equal(requests.length, 1);
    assert.equal(decryptIndependently(requests[0].options.body).personId, "luzhen");
  });
});

test("unsubscribe cancels pending alarms and removes provider credentials, even with missing VAPID", async () => {
  const f = await fixture();
  await f.enable();
  await f.api("test", { personId: "luzhen", delaySeconds: 20 });
  delete f.env.LIMINAL_VAPID_PRIVATE_KEY;
  assert.equal((await f.api("unsubscribe")).status, 200);
  assert.equal(f.object().storage.alarm, null);
  assert.equal(await f.object().storage.get("subscription"), undefined);
  await withProvider(async requests => { await f.object().alarm(); assert.equal(requests.length, 0); });
});

test("logout revokes only the signed current device and clears both cookies", async () => {
  const f = await fixture();
  await f.enable();
  await f.api("test", { personId: "luzhen", delaySeconds: 20 });
  const other = f.env.PUSH_DEVICES.get("another-installation");
  await other.storage.put("subscription", { marker: "other" });
  const response = await worker.fetch(new Request(`${origin}/__liminal/logout`, { headers: { Cookie: f.cookie() } }), f.env);
  assert.equal(response.status, 200);
  const cookies = response.headers.getSetCookie();
  assert(cookies.some(value => value.startsWith("__Host-liminal_session=") && value.includes("Max-Age=0")));
  assert(cookies.some(value => value.startsWith("__Host-liminal_push_device=") && value.includes("Max-Age=0")));
  assert.equal(await f.object().storage.get("subscription"), undefined);
  assert.deepEqual(await other.storage.get("subscription"), { marker: "other" });
  await withProvider(async requests => { await f.object().alarm(); assert.equal(requests.length, 0); });
});

test("a failed logout revocation does not pretend that the device has stopped receiving", async () => {
  const f = await fixture();
  await f.enable();
  f.env.PUSH_DEVICES.get = () => ({ fetch: async () => { throw new Error("unavailable"); } });
  const response = await worker.fetch(new Request(`${origin}/__liminal/logout`, { headers: { Cookie: f.cookie() } }), f.env);
  assert.equal(response.status, 503);
  assert.equal(response.headers.get("Set-Cookie"), null);
});

test("an internal unsubscribe failure cannot be reported as a successful revocation", async () => {
  const f = await fixture();
  await f.enable();
  f.env.PUSH_DEVICES.get = () => ({ fetch: async () => new Response("unavailable", { status: 503 }) });
  assert.equal((await f.api("unsubscribe")).status, 503);
});

test("provider 410 removes a dead subscription; transient failures retry a bounded number of times", async () => {
  const expired = await fixture();
  await expired.enable();
  await withProvider(async () => {
    await expired.api("test", { personId: "luzhen", delaySeconds: 0 });
    assert.equal(await expired.object().storage.get("subscription"), undefined);
    assert.equal((await expired.object().storage.get("lastTest")).state, "expired");
  }, 410);
  const retry = await fixture();
  await retry.enable();
  await withProvider(async requests => {
    assert.equal((await retry.api("test", { personId: "luzhen", delaySeconds: 0 })).status, 202);
    for (let index = 0; index < 2; index += 1) {
      const job = await retry.object().storage.get("pendingTest");
      await retry.object().storage.put("pendingTest", { ...job, dueAt: Date.now() - 1 });
      await retry.object().alarm();
    }
    assert.equal(requests.length, 3);
    assert.equal((await retry.object().storage.get("lastTest")).state, "failed");
    assert.equal(retry.object().storage.alarm, null);
    assert.equal(await retry.object().storage.get("pendingTest"), undefined);
  }, 503);
});

test("a queued job cannot outlive its authenticated session", async () => {
  const f = await fixture();
  await f.enable();
  await f.api("test", { personId: "luzhen", delaySeconds: 20 });
  const record = await f.object().storage.get("subscription");
  await f.object().storage.put("subscription", { ...record, authorizedUntil: Date.now() - 1 });
  await withProvider(async requests => {
    await f.object().alarm();
    assert.equal(requests.length, 0);
    assert.equal(await f.object().storage.get("subscription"), undefined);
  });
});

test("mismatched VAPID keys are rejected without exposing key values", async () => {
  const f = await fixture();
  const wrong = await crypto.subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, true, ["sign", "verify"]);
  f.env.LIMINAL_VAPID_PRIVATE_KEY = (await crypto.subtle.exportKey("jwk", wrong.privateKey)).d;
  await assert.rejects(readVapidConfig(f.env));
  const response = await f.api("config");
  assert.equal(response.status, 503);
  assert(!(await response.text()).includes(f.env.LIMINAL_VAPID_PRIVATE_KEY));
});
