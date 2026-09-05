const SESSION_COOKIE = "__Host-liminal_session";
const SESSION_VERSION = 1;
const SESSION_LIFETIME_SECONDS = 30 * 24 * 60 * 60;
const LOGIN_PATH = "/__liminal/login";
const LOGOUT_PATH = "/__liminal/logout";
const encoder = new TextEncoder();

const SECURITY_HEADERS = {
  "Cache-Control": "private, no-store, max-age=0",
  "Expires": "0",
  "Pragma": "no-cache",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
  "X-Robots-Tag": "noindex, nofollow, noarchive"
};

const LOGIN_CSP = [
  "default-src 'none'",
  "style-src 'unsafe-inline'",
  "form-action 'self'",
  "base-uri 'none'",
  "frame-ancestors 'none'"
].join("; ");

export default {
  async fetch(request, env) {
    if (!hasRequiredConfiguration(env)) {
      return configurationErrorResponse(request);
    }

    const url = new URL(request.url);

    if (url.pathname === LOGOUT_PATH) {
      return logoutResponse();
    }

    const sessionIsValid = await hasValidSession(request, env.LIMINAL_SESSION_SECRET);

    if (url.pathname === LOGIN_PATH) {
      return handleLogin(request, env, sessionIsValid);
    }

    if (!sessionIsValid) {
      return unauthenticatedResponse(request, url);
    }

    return fetchProtectedAsset(request, env, url);
  }
};

function hasRequiredConfiguration(env) {
  return Boolean(
    env &&
      typeof env.LIMINAL_ACCESS_PASSWORD === "string" &&
      env.LIMINAL_ACCESS_PASSWORD.length > 0 &&
      typeof env.LIMINAL_SESSION_SECRET === "string" &&
      env.LIMINAL_SESSION_SECRET.length > 0 &&
      env.ASSETS &&
      typeof env.ASSETS.fetch === "function"
  );
}
async function handleLogin(request, env, sessionIsValid) {
  const url = new URL(request.url);
  const next = safeNextPath(url.searchParams.get("next"), url.origin);

  if (request.method === "GET" || request.method === "HEAD") {
    if (sessionIsValid) {
      return redirectResponse(next, 303);
    }

    return htmlResponse(loginPage({ next }), 200, request.method === "HEAD");
  }

  if (request.method !== "POST") {
    return textResponse("Method Not Allowed", 405, { Allow: "GET, HEAD, POST" });
  }

  const contentType = request.headers.get("Content-Type") || "";
  const declaredLength = Number(request.headers.get("Content-Length") || 0);

  if (
    !contentType.toLowerCase().startsWith("application/x-www-form-urlencoded") ||
    (Number.isFinite(declaredLength) && declaredLength > 4096)
  ) {
    return htmlResponse(loginPage({ next, error: true }), 401);
  }

  let form;
  try {
    const body = await request.text();
    if (body.length > 4096) {
      return htmlResponse(loginPage({ next, error: true }), 401);
    }
    form = new URLSearchParams(body);
  } catch (error) {
    console.error("Unable to read login request.", error);
    return htmlResponse(loginPage({ next, error: true }), 401);
  }

  const password = form.get("password") || "";
  const submittedNext = safeNextPath(form.get("next"), url.origin);
  const passwordIsValid = await secureStringEqual(password, env.LIMINAL_ACCESS_PASSWORD);

  if (!passwordIsValid) {
    return htmlResponse(loginPage({ next: submittedNext, error: true }), 401);
  }

  const token = await createSessionToken(env.LIMINAL_SESSION_SECRET);
  const response = redirectResponse(submittedNext, 303);
  response.headers.append("Set-Cookie", sessionCookie(token));
  return response;
}

async function fetchProtectedAsset(request, env, url) {
  const assetUrl = new URL(url);
  if (assetUrl.pathname === "/") {
    assetUrl.pathname = "/index.html";
  }

  try {
    const assetRequest = assetUrl.href === url.href
      ? request
      : new Request(assetUrl, request);
    const assetResponse = await env.ASSETS.fetch(assetRequest);
    return protectedAssetResponse(assetResponse);
  } catch (error) {
    console.error("Protected asset request failed.", error);
    return textResponse("Unable to load Liminal.", 500);
  }
}

function unauthenticatedResponse(request, url) {
  if (isHtmlNavigation(request, url)) {
    const loginUrl = new URL(LOGIN_PATH, url.origin);
    loginUrl.searchParams.set("next", `${url.pathname}${url.search}`);
    return redirectResponse(`${loginUrl.pathname}${loginUrl.search}`, 302);
  }

  return textResponse("Authentication required.", 401, {
    "WWW-Authenticate": "Liminal"
  });
}

function isHtmlNavigation(request, url) {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return false;
  }

  const lastSegment = url.pathname.split("/").pop() || "";
  const isHtmlPath =
    url.pathname.endsWith("/") ||
    lastSegment.endsWith(".html") ||
    !lastSegment.includes(".");

  if (!isHtmlPath) {
    return false;
  }

  return (
    request.headers.get("Sec-Fetch-Mode") === "navigate" ||
    (request.headers.get("Accept") || "").includes("text/html")
  );
}

async function hasValidSession(request, secret) {
  const token = readCookie(request.headers.get("Cookie"), SESSION_COOKIE);
  if (!token) {
    return false;
  }

  return verifySessionToken(token, secret);
}

export async function createSessionToken(
  secret,
  nowSeconds = Math.floor(Date.now() / 1000),
  lifetimeSeconds = SESSION_LIFETIME_SECONDS
) {
  const payload = {
    v: SESSION_VERSION,
    iat: nowSeconds,
    exp: nowSeconds + lifetimeSeconds
  };
  const payloadPart = base64UrlEncode(encoder.encode(JSON.stringify(payload)));
  const unsignedToken = `${SESSION_VERSION}.${payloadPart}`;
  const signature = await signHmac(unsignedToken, secret);
  return `${unsignedToken}.${base64UrlEncode(signature)}`;
}

export async function verifySessionToken(
  token,
  secret,
  nowSeconds = Math.floor(Date.now() / 1000)
) {
  if (typeof token !== "string" || typeof secret !== "string" || !secret) {
    return false;
  }

  const parts = token.split(".");
  if (parts.length !== 3 || parts[0] !== String(SESSION_VERSION)) {
    return false;
  }

  let signature;
  let payload;
  try {
    signature = base64UrlDecode(parts[2]);
    payload = JSON.parse(new TextDecoder().decode(base64UrlDecode(parts[1])));
  } catch {
    return false;
  }

  const unsignedToken = `${parts[0]}.${parts[1]}`;
  const signatureIsValid = await verifyHmac(unsignedToken, signature, secret);
  if (!signatureIsValid) {
    return false;
  }

  return Boolean(
    payload &&
      payload.v === SESSION_VERSION &&
      Number.isInteger(payload.iat) &&
      Number.isInteger(payload.exp) &&
      payload.iat <= nowSeconds + 60 &&
      payload.exp > nowSeconds &&
      payload.exp > payload.iat &&
      payload.exp - payload.iat <= SESSION_LIFETIME_SECONDS
  );
}

async function secureStringEqual(left, right) {
  const [leftHash, rightHash] = await Promise.all([
    crypto.subtle.digest("SHA-256", encoder.encode(left)),
    crypto.subtle.digest("SHA-256", encoder.encode(right))
  ]);
  const leftBytes = new Uint8Array(leftHash);
  const rightBytes = new Uint8Array(rightHash);
  let difference = 0;

  for (let index = 0; index < leftBytes.length; index += 1) {
    difference |= leftBytes[index] ^ rightBytes[index];
  }

  return difference === 0;
}

async function signHmac(value, secret) {
  const key = await importHmacKey(secret, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return new Uint8Array(signature);
}

async function verifyHmac(value, signature, secret) {
  try {
    const key = await importHmacKey(secret, ["verify"]);
    return await crypto.subtle.verify("HMAC", key, signature, encoder.encode(value));
  } catch {
    return false;
  }
}

function importHmacKey(secret, usages) {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    usages
  );
}

function base64UrlEncode(bytes) {
  let binary = "";
  for (let index = 0; index < bytes.length; index += 1) {
    binary += String.fromCharCode(bytes[index]);
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function base64UrlDecode(value) {
  if (!/^[A-Za-z0-9_-]+$/.test(value)) {
    throw new Error("Invalid base64url value.");
  }

  const padded = value.replace(/-/g, "+").replace(/_/g, "/")
    + "=".repeat((4 - (value.length % 4)) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function readCookie(header, name) {
  if (!header) {
    return "";
  }

  for (const part of header.split(";")) {
    const separator = part.indexOf("=");
    if (separator < 0) {
      continue;
    }
    if (part.slice(0, separator).trim() === name) {
      return part.slice(separator + 1).trim();
    }
  }

  return "";
}

function safeNextPath(candidate, origin) {
  if (typeof candidate !== "string" || !candidate.startsWith("/") || candidate.startsWith("//")) {
    return "/";
  }

  try {
    const destination = new URL(candidate, origin);
    if (destination.origin !== origin || destination.pathname === LOGIN_PATH || destination.pathname === LOGOUT_PATH) {
      return "/";
    }
    return `${destination.pathname}${destination.search}${destination.hash}`;
  } catch {
    return "/";
  }
}

function sessionCookie(token) {
  return [
    `${SESSION_COOKIE}=${token}`,
    `Max-Age=${SESSION_LIFETIME_SECONDS}`,
    "Path=/",
    "HttpOnly",
    "Secure",
    "SameSite=Lax"
  ].join("; ");
}

function expiredSessionCookie() {
  return [
    `${SESSION_COOKIE}=`,
    "Max-Age=0",
    "Expires=Thu, 01 Jan 1970 00:00:00 GMT",
    "Path=/",
    "HttpOnly",
    "Secure",
    "SameSite=Lax"
  ].join("; ");
}

function logoutResponse() {
  const response = htmlResponse(loginPage({}), 200);
  response.headers.append("Set-Cookie", expiredSessionCookie());
  return response;
}

function configurationErrorResponse(request) {
  const url = new URL(request.url);
  if (isHtmlNavigation(request, url) || url.pathname === LOGIN_PATH) {
    return htmlResponse(configurationErrorPage(), 503, request.method === "HEAD");
  }
  return textResponse("Liminal server configuration error.", 503);
}

function protectedAssetResponse(response) {
  const headers = new Headers(response.headers);
  applySecurityHeaders(headers);
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

function redirectResponse(location, status) {
  const headers = new Headers({ Location: location });
  applySecurityHeaders(headers);
  return new Response(null, { status, headers });
}

function textResponse(text, status, extraHeaders = {}) {
  const headers = new Headers({
    "Content-Type": "text/plain; charset=utf-8",
    ...extraHeaders
  });
  applySecurityHeaders(headers);
  return new Response(text, { status, headers });
}

function htmlResponse(html, status, omitBody = false) {
  const headers = new Headers({
    "Content-Type": "text/html; charset=utf-8",
    "Content-Security-Policy": LOGIN_CSP
  });
  applySecurityHeaders(headers);
  return new Response(omitBody ? null : html, { status, headers });
}

function applySecurityHeaders(headers) {
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
    headers.set(name, value);
  }
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function loginPage({ next = "/", error = false } = {}) {
  const safeNext = escapeHtml(next);
  const errorMessage = error
    ? '<p class="error" role="alert">访问密钥错误</p>'
    : '<p class="error" aria-hidden="true">&nbsp;</p>';

  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta name="theme-color" content="#f4f3f0">
  <title>Liminal · Private Space</title>
  <style>
    :root { color-scheme: light; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    * { box-sizing: border-box; }
    html, body { min-height: 100%; }
    body {
      margin: 0;
      min-height: 100svh;
      display: grid;
      place-items: center;
      padding: max(24px, env(safe-area-inset-top)) 24px max(24px, env(safe-area-inset-bottom));
      background: #f4f3f0;
      color: #20201f;
    }
    main { width: min(100%, 360px); }
    .eyebrow { margin: 0 0 8px; color: #77766f; font-size: 12px; letter-spacing: .24em; }
    h1 { margin: 0 0 42px; font-family: Georgia, "Times New Roman", serif; font-size: 34px; font-weight: 400; letter-spacing: -.03em; }
    form { display: grid; gap: 14px; }
    label { color: #77766f; font-size: 13px; letter-spacing: .08em; }
    input, button { width: 100%; min-height: 48px; border-radius: 14px; font: inherit; }
    input { border: 1px solid #d8d7d1; background: #fff; color: #20201f; padding: 0 16px; outline: none; }
    input:focus { border-color: #8d8c84; box-shadow: 0 0 0 3px rgba(80, 78, 72, .08); }
    button { border: 0; background: #2f302e; color: #fff; cursor: pointer; }
    button:focus-visible { outline: 3px solid rgba(47, 48, 46, .24); outline-offset: 3px; }
    .error { min-height: 20px; margin: 2px 0 0; color: #8f4a43; font-size: 13px; }
  </style>
</head>
<body>
  <main>
    <p class="eyebrow">LIMINAL</p>
    <h1>Private Space</h1>
    <form method="post" action="${LOGIN_PATH}" autocomplete="on">
      <input type="hidden" name="next" value="${safeNext}">
      <label for="password">Access key</label>
      <input id="password" name="password" type="password" autocomplete="current-password" required autofocus>
      <button type="submit">进入</button>
      ${errorMessage}
    </form>
  </main>
</body>
</html>`;
}

function configurationErrorPage() {
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta name="theme-color" content="#f4f3f0">
  <title>Liminal · Configuration Error</title>
</head>
<body style="margin:0;min-height:100svh;display:grid;place-items:center;padding:24px;background:#f4f3f0;color:#20201f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <main style="max-width:32rem"><p style="letter-spacing:.2em;color:#77766f">LIMINAL</p><h1 style="font:400 30px Georgia,serif">服务器配置错误</h1><p>访问保护尚未正确配置，请稍后再试。</p></main>
</body>
</html>`;
}
