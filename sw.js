/* Liminal notification-only worker. No fetch handler, Cache API, or offline assets. */
const INBOX_DATABASE = "liminal_push_inbox";
const INBOX_VERSION = 1;

function openInbox() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(INBOX_DATABASE, INBOX_VERSION);
    request.onupgradeneeded = () => {
      // Reserved for future background-message envelopes. No current Chat reads this store.
      if (!request.result.objectStoreNames.contains("messages")) {
        request.result.createObjectStore("messages", { keyPath: "eventId" });
      }
      if (!request.result.objectStoreNames.contains("testReceipts")) {
        request.result.createObjectStore("testReceipts", { keyPath: "eventId" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error("Notification inbox is blocked."));
  });
}

async function saveTestReceipt(payload) {
  const database = await openInbox();
  try {
    await new Promise((resolve, reject) => {
      const transaction = database.transaction("testReceipts", "readwrite");
      const store = transaction.objectStore("testReceipts");
      store.put({ eventId: payload.eventId, personId: payload.personId,
        receivedAt: new Date().toISOString(), kind: "test" });
      const request = store.getAll();
      request.onsuccess = () => {
        const receipts = request.result.sort((a, b) => a.receivedAt.localeCompare(b.receivedAt));
        // Test diagnostics have a bounded footprint; the future messages store stays empty.
        for (const receipt of receipts.slice(0, Math.max(0, receipts.length - 30))) {
          store.delete(receipt.eventId);
        }
      };
      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    });
  } finally {
    database.close();
  }
}

function chatDestination(personId) {
  return new URL(`chat.html?person=${personId === "jasper" ? "jasper" : "luzhen"}`,
    self.registration.scope).href;
}

self.addEventListener("push", event => {
  event.waitUntil((async () => {
    let payload;
    try { payload = event.data?.json(); } catch { payload = null; }
    const valid = payload?.version === 1 && payload.kind === "test"
      && typeof payload.eventId === "string" && payload.eventId.length <= 100
      && ["luzhen", "jasper"].includes(payload.personId);
    // Every delivered push displays a notification, even if data or IndexedDB fails.
    const title = valid ? "Liminal · 测试通知" : "Liminal";
    const name = payload?.personId === "jasper" ? "Jasper" : "榛榛";
    await self.registration.showNotification(title, {
      body: valid ? `通知通道已连通。点此进入与${name}的聊天。` : "收到一条通知，请打开 Liminal 查看。",
      icon: new URL("icons/liminal-icon-192.png", self.registration.scope).href,
      tag: valid ? `liminal-test-${payload.eventId}` : "liminal-notification",
      data: { url: chatDestination(payload?.personId) }
    });
    if (valid) {
      try { await saveTestReceipt(payload); }
      catch { /* A storage error must never prevent the user-visible notification. */ }
      const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      for (const client of windows) {
        client.postMessage({ type: "liminal-push-test-received", eventId: payload.eventId });
      }
    }
  })());
});

self.addEventListener("notificationclick", event => {
  event.notification.close();
  event.waitUntil((async () => {
    const destination = new URL(event.notification.data?.url || chatDestination("luzhen"));
    const scope = new URL(self.registration.scope);
    if (destination.origin !== scope.origin || !destination.pathname.startsWith(scope.pathname)
      || destination.pathname !== new URL("chat.html", scope).pathname) return;
    const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const client of windows) {
      if (client.url === destination.href && "focus" in client) {
        await client.focus();
        return;
      }
    }
    for (const client of windows) {
      const clientUrl = new URL(client.url);
      if (clientUrl.origin === scope.origin && clientUrl.pathname.startsWith(scope.pathname)
        && "navigate" in client) {
        const navigated = await client.navigate(destination.href);
        if (navigated) { await navigated.focus(); return; }
      }
    }
    await self.clients.openWindow(destination.href);
  })());
});
