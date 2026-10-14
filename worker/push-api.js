import { readVapidConfig, validateSubscription, encodeBase64Url, decodeBase64Url } from "./web-push.js";

const DEVICE_COOKIE = "__Host-liminal_push_device";
const encoder = new TextEncoder();
const API_PREFIX = "/__liminal/push/";

export function isPushApi(url) {
  return url.pathname.startsWith(API_PREFIX);
}

function readCookie(request, name) {
  for (const part of (request.headers.get("Cookie") || "").split(";")) {
    const index = part.indexOf("=");
    if (part.slice(0, index).trim() === name) return part.slice(index + 1).trim();
  }
  return "";
}

async function deviceKey(secret, usages) {
  // Domain-separated from session signing; existing session format is untouched.
  return crypto.subtle.importKey("raw", encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" }, false, usages);
}

async function signedDeviceId(id, secret) {
  const signature = await crypto.subtle.sign("HMAC", await deviceKey(secret, ["sign"]),
    encoder.encode(`liminal-push-device-v1:${id}`));
  return `${id}.${encodeBase64Url(signature)}`;
}

async function getDeviceId(request, env) {
  const token = readCookie(request, DEVICE_COOKIE);
  const [id, signature, extra] = token.split(".");
  if (!id || !/^[0-9a-f-]{36}$/.test(id) || !signature || extra !== undefined) return null;
  try {
    const valid = await crypto.subtle.verify("HMAC", await deviceKey(env.LIMINAL_SESSION_SECRET, ["verify"]),
      decodeBase64Url(signature), encoder.encode(`liminal-push-device-v1:${id}`));
    return valid ? id : null;
  } catch {
    return null;
  }
}

function stub(env, id) {
  return env.PUSH_DEVICES.get(env.PUSH_DEVICES.idFromName(id));
}

function sessionExpiry(request) {
  const payload = readCookie(request, "__Host-liminal_session").split(".")[1];
  // Caller has already verified the existing session signature.
  return JSON.parse(new TextDecoder().decode(decodeBase64Url(payload))).exp * 1000;
}

export async function handlePushApi(request, env) {
  const url = new URL(request.url);
  if (request.method !== "POST") {
    return Response.json({ error: "请使用同源 POST 请求。" }, { status: 405, headers: { Allow: "POST" } });
  }
  if (request.headers.get("Origin") !== url.origin
    || request.headers.get("X-Liminal-Push") !== "1"
    || !request.headers.get("Content-Type")?.toLowerCase().startsWith("application/json")) {
    return Response.json({ error: "仅允许当前 Liminal 页面发起请求。" }, { status: 403 });
  }
  const action = url.pathname.slice(API_PREFIX.length);
  if (!["config", "subscribe", "unsubscribe", "test"].includes(action)) {
    return Response.json({ error: "通知接口不存在。" }, { status: 404 });
  }
  if (!env.PUSH_DEVICES || typeof env.PUSH_DEVICES.idFromName !== "function") {
    return Response.json({ error: "通知服务尚未配置。" }, { status: 503 });
  }
  let input;
  try {
    if (Number(request.headers.get("Content-Length")) > 8192) throw new Error();
    const text = await request.text();
    if (text.length > 8192) throw new Error();
    input = JSON.parse(text);
    if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error();
  } catch {
    return Response.json({ error: "通知请求格式无效。" }, { status: 400 });
  }
  let id = await getDeviceId(request, env);
  try {
    // Revocation stays available even if the VAPID configuration is broken.
    if (action === "unsubscribe") {
      if (id) {
        const response = await stub(env, id).fetch(new Request("https://push.internal/unsubscribe", { method: "POST" }));
        if (!response.ok) throw new Error("Push revocation failed.");
      }
      return Response.json({ enabled: false });
    }
    let config;
    try {
      config = await readVapidConfig(env);
    } catch {
      return Response.json({ error: "通知服务密钥尚未正确配置，请联系站点维护者。" }, { status: 503 });
    }
    if (action === "config") {
      const isNew = !id;
      if (isNew) id = crypto.randomUUID();
      const status = await stub(env, id).fetch(new Request("https://push.internal/status"));
      if (!status.ok) throw new Error();
      const response = Response.json({ publicKey: config.publicKey, ...await status.json() });
      if (isNew) response.headers.set("Set-Cookie", [
        `${DEVICE_COOKIE}=${await signedDeviceId(id, env.LIMINAL_SESSION_SECRET)}`,
        "Max-Age=31536000", "Path=/", "HttpOnly", "Secure", "SameSite=Strict"
      ].join("; "));
      return response;
    }
    if (!id) return Response.json({ error: "请重新打开通知设置后再试。" }, { status: 409 });
    if (action === "test") {
      if (!["luzhen", "jasper"].includes(input.personId) || ![0, 20].includes(input.delaySeconds)) {
        return Response.json({ error: "测试人物或等待时间无效。" }, { status: 400 });
      }
    }
    const data = action === "subscribe" ? {
      subscription: input.subscription, origin: url.origin,
      authorizedUntil: sessionExpiry(request), publicKey: config.publicKey
    } : { personId: input.personId, delaySeconds: input.delaySeconds, publicKey: config.publicKey };
    if (action === "subscribe") {
      // Validate before passing to the internal object; keep malformed data out of storage.
      try { data.subscription = await validateSubscription(input.subscription); }
      catch { return Response.json({ error: "通知订阅数据无效，请重新开启通知。" }, { status: 400 }); }
    }
    return await stub(env, id).fetch(new Request(`https://push.internal/${action}`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data)
    }));
  } catch {
    return Response.json({ error: "通知服务暂时不可用，请稍后重试。" }, { status: 503 });
  }
}

export async function revokeDeviceOnLogout(request, env) {
  const id = await getDeviceId(request, env);
  if (!id) return;
  if (!env.PUSH_DEVICES) throw new Error("Push revocation unavailable.");
  const response = await stub(env, id).fetch(new Request("https://push.internal/unsubscribe", { method: "POST" }));
  if (!response.ok) throw new Error("Push revocation failed.");
}

export function expirePushDeviceCookie() {
  return `${DEVICE_COOKIE}=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Strict`;
}
