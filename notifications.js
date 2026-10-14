(function () {
  "use strict";
  const status = document.getElementById("pushStatus");
  const testStatus = document.getElementById("testStatus");
  const enable = document.getElementById("enablePush");
  const disable = document.getElementById("disablePush");
  const testNow = document.getElementById("testPushNow");
  const testLater = document.getElementById("testPushLater");
  const person = document.getElementById("testPerson");
  const base = new URL("./", document.baseURI);
  const ios = /iPad|iPhone|iPod/.test(navigator.userAgent)
    || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const standalone = navigator.standalone === true || matchMedia("(display-mode: standalone)").matches;
  const supported = isSecureContext && "serviceWorker" in navigator && "PushManager" in window
    && "Notification" in window;
  let config = null;
  let busy = false;
  let refreshing = false;
  let refreshTimer = null;
  document.getElementById("currentOrigin").textContent = location.origin + base.pathname;

  function message(element, text, error = false) {
    element.textContent = text;
    element.dataset.error = String(error);
  }

  async function api(action, body = {}) {
    const response = await fetch(new URL(`__liminal/push/${action}`, base), {
      method: "POST", credentials: "same-origin", cache: "no-store",
      headers: { "Content-Type": "application/json", "X-Liminal-Push": "1" },
      body: JSON.stringify(body)
    });
    if (response.status === 401) throw new Error("登录已过期，请重新登录 Liminal 后再试。");
    if (!response.headers.get("Content-Type")?.includes("application/json")) {
      throw new Error("当前地址没有通知服务。请使用部署了 Web Push 的 Cloudflare 地址。");
    }
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "通知发送失败，请稍后重试。");
    return data;
  }

  function render() {
    enable.disabled = busy || !config || !supported || (ios && !standalone);
    enable.textContent = config?.enabled ? "重新连接通知" : "开启通知";
    disable.disabled = busy || !config;
    testNow.disabled = busy || !config?.enabled;
    testLater.disabled = busy || !config?.enabled;
  }

  function renderTest(result) {
    if (!result) return;
    const texts = {
      queued: "测试已安排。现在可以切换 App 或锁屏，约 20 秒后发送。",
      retrying: "推送服务暂时不可用，服务器正在重试。",
      accepted: "推送服务已接收测试通知；请确认 iPhone 是否实际显示。",
      expired: "本设备订阅已失效，请重新开启通知。",
      failed: "测试发送失败。请检查 Cloudflare 通知密钥后重试。"
    };
    message(testStatus, texts[result.state] || "测试状态已更新。", ["expired", "failed"].includes(result.state));
  }

  async function refresh() {
    if (busy || refreshing) return;
    refreshing = true;
    try {
      config = await api("config");
      if (ios && !standalone) {
        message(status, "请先添加到 iPhone 主屏幕，并从主屏幕图标打开。此处不会申请通知权限。");
      } else if (!supported) {
        message(status, "当前浏览器暂不支持 Web Push。iPhone 请使用 iOS 16.4 或更新版本的主屏幕 Web App。");
      } else if (Notification.permission === "denied") {
        message(status, "系统通知权限已关闭。请在 iPhone 设置 → 通知中允许 Liminal 通知。", true);
      } else {
        message(status, config.enabled ? "本设备通知已开启。" : "本设备通知尚未开启。");
      }
      renderTest(config.lastTest);
    } catch (error) {
      config = null;
      message(status, error.message, true);
    } finally {
      refreshing = false;
    }
    render();
  }

  function publicKeyBytes(value) {
    const binary = atob(value.replace(/-/g, "+").replace(/_/g, "/")
      + "=".repeat((4 - value.length % 4) % 4));
    return Uint8Array.from(binary, character => character.charCodeAt(0));
  }

  async function readyRegistration() {
    const registration = await navigator.serviceWorker.register(new URL("sw.js", base).href,
      { scope: base.pathname, updateViaCache: "none" });
    if (registration.active) return registration;
    return Promise.race([
      navigator.serviceWorker.ready,
      new Promise((_, reject) => setTimeout(() => reject(new Error("通知服务初始化超时，请刷新后重试。")), 15000))
    ]);
  }

  enable.addEventListener("click", async () => {
    if (busy || !config || !supported || (ios && !standalone)) return;
    busy = true;
    render();
    let registration;
    let subscription;
    let newlySubscribed = false;
    try {
      // Invoke directly in the click handler, before any network/registration await.
      const permission = Notification.permission === "granted"
        ? "granted" : await Notification.requestPermission();
      if (permission !== "granted") throw new Error("尚未允许通知。你可以稍后再开启。");
      registration = await readyRegistration();
      subscription = await registration.pushManager.getSubscription();
      const key = publicKeyBytes(config.publicKey);
      if (subscription) {
        const oldKey = subscription.options.applicationServerKey;
        if (oldKey && btoa(String.fromCharCode(...new Uint8Array(oldKey))) !== btoa(String.fromCharCode(...key))) {
          await api("unsubscribe");
          config.enabled = false;
          if (!await subscription.unsubscribe()) throw new Error("旧订阅清理失败，请先关闭通知后重试。");
          subscription = null;
        }
      }
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key });
        newlySubscribed = true;
      }
      await api("subscribe", { subscription: subscription.toJSON() });
      config.enabled = true;
      message(status, "本设备通知已开启，可以发送测试通知。");
    } catch (error) {
      if (newlySubscribed && subscription) {
        try { await subscription.unsubscribe(); } catch { /* The server did not enable this subscription. */ }
      }
      message(status, error.message || "开启通知失败，请稍后重试。", true);
    } finally {
      busy = false;
      render();
    }
  });

  disable.addEventListener("click", async () => {
    if (busy || !config) return;
    busy = true;
    render();
    try {
      await api("unsubscribe");
      config.enabled = false;
      clearTimeout(refreshTimer);
      if ("serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.getRegistration(new URL("sw.js", base).href);
        const subscription = await registration?.pushManager.getSubscription();
        if (subscription && !await subscription.unsubscribe()) throw new Error("服务器通知已关闭；浏览器订阅清理失败，请重试。");
      }
      message(status, "本设备通知已关闭，待发送测试也已取消。");
      message(testStatus, "");
    } catch (error) {
      message(status, error.message, true);
    } finally {
      busy = false;
      render();
    }
  });

  async function test(delaySeconds) {
    if (busy || !config?.enabled) return;
    busy = true;
    render();
    try {
      const result = await api("test", { personId: person.value, delaySeconds });
      renderTest(result.lastTest);
      clearTimeout(refreshTimer);
      refreshTimer = setTimeout(refresh, delaySeconds * 1000 + 5000);
    } catch (error) {
      message(testStatus, error.message, true);
    } finally {
      busy = false;
      render();
    }
  }
  testNow.addEventListener("click", () => test(0));
  testLater.addEventListener("click", () => test(20));
  navigator.serviceWorker?.addEventListener("message", event => {
    if (event.data?.type === "liminal-push-test-received") {
      message(testStatus, "本设备已收到测试推送。点击系统通知可进入 Chat。");
    }
  });
  window.addEventListener("pageshow", refresh);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) refresh(); });
  // Loading only checks capabilities/server status; it never requests permission or registers a worker.
  refresh();
}());
