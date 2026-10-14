// RFC 8291 (aes128gcm) and RFC 8292 (VAPID), using Workers Web Crypto only.
const encoder = new TextEncoder();

export function encodeBase64Url(bytes) {
  return btoa(String.fromCharCode(...new Uint8Array(bytes)))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export function decodeBase64Url(value) {
  if (typeof value !== "string" || !/^[A-Za-z0-9_-]+$/.test(value)) {
    throw new Error("Invalid base64url.");
  }
  const binary = atob(value.replace(/-/g, "+").replace(/_/g, "/")
    + "=".repeat((4 - value.length % 4) % 4));
  return Uint8Array.from(binary, character => character.charCodeAt(0));
}

function concat(...arrays) {
  const result = new Uint8Array(arrays.reduce((sum, array) => sum + array.length, 0));
  let offset = 0;
  for (const array of arrays) {
    result.set(array, offset);
    offset += array.length;
  }
  return result;
}

async function hkdf(ikm, salt, info, length) {
  const key = await crypto.subtle.importKey("raw", ikm, "HKDF", false, ["deriveBits"]);
  return new Uint8Array(await crypto.subtle.deriveBits(
    { name: "HKDF", hash: "SHA-256", salt, info }, key, length * 8
  ));
}

export function publicKeyJwk(bytes) {
  if (bytes.length !== 65 || bytes[0] !== 4) throw new Error("Invalid P-256 public key.");
  return { kty: "EC", crv: "P-256", x: encodeBase64Url(bytes.slice(1, 33)),
    y: encodeBase64Url(bytes.slice(33, 65)), ext: true };
}

export async function validateSubscription(value) {
  if (!value || typeof value !== "object" || typeof value.endpoint !== "string"
    || value.endpoint.length > 2048) throw new Error("Invalid push subscription.");
  const url = new URL(value.endpoint);
  const host = url.hostname;
  // Never turn an authenticated subscription request into an arbitrary outbound fetch.
  const allowed = host.endsWith(".push.apple.com") || host === "fcm.googleapis.com"
    || host === "updates.push.services.mozilla.com" || host.endsWith(".notify.windows.com");
  if (url.protocol !== "https:" || url.port || url.username || url.password || url.hash || !allowed) {
    throw new Error("Unsupported push service.");
  }
  const publicKey = decodeBase64Url(value.keys?.p256dh);
  const auth = decodeBase64Url(value.keys?.auth);
  if (auth.length !== 16) throw new Error("Invalid subscription authentication key.");
  await crypto.subtle.importKey("jwk", publicKeyJwk(publicKey),
    { name: "ECDH", namedCurve: "P-256" }, false, []);
  return { endpoint: url.href, keys: {
    p256dh: encodeBase64Url(publicKey), auth: encodeBase64Url(auth)
  } };
}

export async function readVapidConfig(env) {
  const publicBytes = decodeBase64Url(env.LIMINAL_VAPID_PUBLIC_KEY);
  const privateBytes = decodeBase64Url(env.LIMINAL_VAPID_PRIVATE_KEY);
  if (privateBytes.length !== 32) throw new Error("Invalid VAPID configuration.");
  const subject = env.LIMINAL_VAPID_SUBJECT;
  const contact = new URL(subject);
  if ((contact.protocol !== "mailto:" && contact.protocol !== "https:")
    || !contact.pathname || contact.username || contact.password) {
    throw new Error("Invalid VAPID contact.");
  }
  const publicJwk = publicKeyJwk(publicBytes);
  const privateKey = await crypto.subtle.importKey("jwk", {
    ...publicJwk, d: encodeBase64Url(privateBytes)
  }, { name: "ECDSA", namedCurve: "P-256" }, false, ["sign"]);
  const publicKey = await crypto.subtle.importKey("jwk", publicJwk,
    { name: "ECDSA", namedCurve: "P-256" }, false, ["verify"]);
  const proof = encoder.encode("Liminal VAPID key-pair check");
  const signature = await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, privateKey, proof);
  if (!await crypto.subtle.verify({ name: "ECDSA", hash: "SHA-256" }, publicKey, signature, proof)) {
    throw new Error("VAPID keys do not match.");
  }
  return { publicKey: encodeBase64Url(publicBytes), privateKey, subject };
}

export async function createVapidAuthorization(endpoint, config, now = Date.now()) {
  const header = encodeBase64Url(encoder.encode(JSON.stringify({ typ: "JWT", alg: "ES256" })));
  const payload = encodeBase64Url(encoder.encode(JSON.stringify({
    aud: new URL(endpoint).origin, exp: Math.floor(now / 1000) + 12 * 60 * 60, sub: config.subject
  })));
  const unsigned = `${header}.${payload}`;
  const signature = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" }, config.privateKey, encoder.encode(unsigned)
  );
  return `vapid t=${unsigned}.${encodeBase64Url(signature)}, k=${config.publicKey}`;
}

// Optional key/salt injection is used only by the RFC known-answer test.
export async function encryptPushPayload(subscription, plaintext, options = {}) {
  const receiverBytes = decodeBase64Url(subscription.keys.p256dh);
  const receiver = await crypto.subtle.importKey("raw", receiverBytes,
    { name: "ECDH", namedCurve: "P-256" }, false, []);
  const pair = options.keyPair || await crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" }, true, ["deriveBits"]
  );
  const senderBytes = new Uint8Array(await crypto.subtle.exportKey("raw", pair.publicKey));
  const sharedSecret = new Uint8Array(await crypto.subtle.deriveBits(
    { name: "ECDH", public: receiver }, pair.privateKey, 256
  ));
  const salt = options.salt || crypto.getRandomValues(new Uint8Array(16));
  const ikm = await hkdf(sharedSecret, decodeBase64Url(subscription.keys.auth),
    concat(encoder.encode("WebPush: info\0"), receiverBytes, senderBytes), 32);
  const cek = await hkdf(ikm, salt, encoder.encode("Content-Encoding: aes128gcm\0"), 16);
  const nonce = await hkdf(ikm, salt, encoder.encode("Content-Encoding: nonce\0"), 12);
  const bytes = typeof plaintext === "string" ? encoder.encode(plaintext) : plaintext;
  if (bytes.length > 3993) throw new Error("Push payload is too large.");
  const key = await crypto.subtle.importKey("raw", cek, "AES-GCM", false, ["encrypt"]);
  const ciphertext = new Uint8Array(await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: nonce, tagLength: 128 }, key, concat(bytes, new Uint8Array([2]))
  ));
  const header = new Uint8Array(21);
  header.set(salt);
  new DataView(header.buffer).setUint32(16, 4096, false);
  header[20] = senderBytes.length;
  return concat(header, senderBytes, ciphertext);
}

export async function sendWebPush(subscription, payload, env) {
  const config = await readVapidConfig(env);
  const [body, authorization] = await Promise.all([
    encryptPushPayload(subscription, JSON.stringify(payload)),
    createVapidAuthorization(subscription.endpoint, config)
  ]);
  const response = await fetch(subscription.endpoint, {
    method: "POST", redirect: "error", signal: AbortSignal.timeout(15000),
    headers: { Authorization: authorization, "Content-Encoding": "aes128gcm",
      "Content-Type": "application/octet-stream", TTL: "300", Urgency: "high" }, body
  });
  // Provider bodies can include subscription details. Do not log or expose them.
  if (response.body) await response.body.cancel();
  return { accepted: response.status === 201 || response.status === 202,
    expired: response.status === 404 || response.status === 410, status: response.status };
}
