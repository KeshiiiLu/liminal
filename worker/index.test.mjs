import { readFileSync } from "node:fs";
import worker, { createSessionToken, verifySessionToken } from "./index.js";

function readLocalSecrets() {
  const values = {};
  const lines = readFileSync(new URL("../.dev.vars", import.meta.url), "utf8").split(/\r?\n/);
  for (const sourceLine of lines) {
    const line = sourceLine.trim();
    if (!line || line.startsWith("#") || !line.includes("=")) continue;
    const separator = line.indexOf("=");
    const name = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();
    if (
      (value.startsWith("\"") && value.endsWith("\"")) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) value = value.slice(1, -1);
    values[name] = value;
  }
  return values;
}

const localSecrets = readLocalSecrets();
const ACCESS_PASSWORD = localSecrets.LIMINAL_ACCESS_PASSWORD;
const SESSION_SECRET = localSecrets.LIMINAL_SESSION_SECRET;
if (!ACCESS_PASSWORD || !SESSION_SECRET) throw new Error("Local test secrets are missing from .dev.vars.");

let assetFetchCount = 0;
const assetBodies = new Map([
  ["/index.html", ["<!doctype html><title>Liminal</title>", "text/html; charset=utf-8"]],
  ["/home.js", ["console.log('home');", "text/javascript; charset=utf-8"]],
  ["/home.css", ["body{}", "text/css; charset=utf-8"]],
  ["/manifest.webmanifest", ["{\"name\":\"Liminal\"}", "application/manifest+json"]],
  ["/cards-corpus-data.js", ["window.CARD_CORPUS = {};", "text/javascript; charset=utf-8"]]
]);
const assets = {
  async fetch(request) {
    assetFetchCount += 1;
    const asset = assetBodies.get(new URL(request.url).pathname);
    return asset
      ? new Response(asset[0], {
          headers: { "Content-Type": asset[1], "Cache-Control": "public, max-age=3600" }
        })
      : new Response("Not Found", { status: 404 });
  }
};
const env = {
  LIMINAL_ACCESS_PASSWORD: ACCESS_PASSWORD,
  LIMINAL_SESSION_SECRET: SESSION_SECRET,
  ASSETS: assets
};

function request(path, options = {}) {
  return new Request(`https://liminal.example${path}`, options);
}
function assert(condition, message) {
  if (!condition) throw new Error(message);
}
async function run(name, check) {
  try {
    await check();
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}: ${error.message}`);
    process.exitCode = 1;
  }
}

await run("missing secrets fail closed without fetching assets", async () => {
  assetFetchCount = 0;
  const response = await worker.fetch(request("/", { headers: { Accept: "text/html" } }), { ASSETS: assets });
  assert(response.status === 503, `expected 503, got ${response.status}`);
  assert(assetFetchCount === 0, "asset binding was called with incomplete configuration");
});

await run("unauthenticated HTML navigation redirects to login", async () => {
  const response = await worker.fetch(
    request("/chat.html?contact=luzhen", { headers: { Accept: "text/html" } }), env
  );
  assert(response.status === 302, `expected 302, got ${response.status}`);
  assert(
    response.headers.get("Location") === "/__liminal/login?next=%2Fchat.html%3Fcontact%3Dluzhen",
    "post-login destination was not preserved"
  );
});

await run("unauthenticated static assets are rejected", async () => {
  assetFetchCount = 0;
  for (const path of ["/home.js", "/home.css", "/manifest.webmanifest", "/cards-corpus-data.js"]) {
    const response = await worker.fetch(request(path), env);
    assert(response.status === 401, `${path} returned ${response.status}`);
  }
  assert(assetFetchCount === 0, "asset binding was called for an unauthenticated request");
});

await run("wrong password is rejected", async () => {
  const response = await worker.fetch(request("/__liminal/login", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: "password=wrong&next=%2F"
  }), env);
  assert(response.status === 401, `expected 401, got ${response.status}`);
  assert(!response.headers.get("Set-Cookie"), "wrong password received a session");
  assert((await response.text()).includes("访问密钥错误"), "error message is missing");
});

let sessionCookieValue = "";
await run("correct password issues a secure 30-day session", async () => {
  const response = await worker.fetch(request("/__liminal/login", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `password=${encodeURIComponent(ACCESS_PASSWORD)}&next=%2F`
  }), env);
  const setCookie = response.headers.get("Set-Cookie") || "";
  assert(response.status === 303, `expected 303, got ${response.status}`);
  for (const attribute of ["Max-Age=2592000", "Path=/", "HttpOnly", "Secure", "SameSite=Lax"]) {
    assert(setCookie.includes(attribute), `cookie is missing ${attribute}`);
  }
  sessionCookieValue = setCookie.split(";", 1)[0];
  assert(!sessionCookieValue.includes(ACCESS_PASSWORD), "cookie contains the password");
});

await run("valid session reads protected assets with private no-store headers", async () => {
  for (const path of ["/", "/home.js", "/home.css", "/manifest.webmanifest"]) {
    const response = await worker.fetch(request(path, { headers: { Cookie: sessionCookieValue } }), env);
    assert(response.status === 200, `${path} returned ${response.status}`);
    assert(response.headers.get("Cache-Control") === "private, no-store, max-age=0", `${path} can be cached`);
    assert(response.headers.get("X-Robots-Tag") === "noindex, nofollow, noarchive", `${path} is indexable`);
    assert(response.headers.get("X-Content-Type-Options") === "nosniff", `${path} lacks nosniff`);
    assert(response.headers.get("Referrer-Policy") === "no-referrer", `${path} lacks referrer protection`);
  }
});

await run("tampered and expired sessions are rejected", async () => {
  const tampered = `${sessionCookieValue.slice(0, -1)}x`;
  const tamperedResponse = await worker.fetch(request("/home.js", { headers: { Cookie: tampered } }), env);
  assert(tamperedResponse.status === 401, `tampered token returned ${tamperedResponse.status}`);

  const now = Math.floor(Date.now() / 1000);
  const expiredToken = await createSessionToken(SESSION_SECRET, now - 120, 60);
  assert(!(await verifySessionToken(expiredToken, SESSION_SECRET, now)), "expired token passed verification");
  const expiredResponse = await worker.fetch(request("/home.js", {
    headers: { Cookie: `__Host-liminal_session=${expiredToken}` }
  }), env);
  assert(expiredResponse.status === 401, `expired token returned ${expiredResponse.status}`);
});

await run("logout expires the cookie", async () => {
  const response = await worker.fetch(request("/__liminal/logout", {
    headers: { Cookie: sessionCookieValue }
  }), env);
  assert(response.status === 200, `expected 200, got ${response.status}`);
  assert((response.headers.get("Set-Cookie") || "").includes("Max-Age=0"), "cookie was not expired");
  assert((await worker.fetch(request("/home.js"), env)).status === 401, "access remained open after logout");
});

await run("external post-login redirects are refused", async () => {
  const response = await worker.fetch(request("/__liminal/login", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `password=${encodeURIComponent(ACCESS_PASSWORD)}&next=${encodeURIComponent("//evil.example/")}`
  }), env);
  assert(response.status === 303, `expected 303, got ${response.status}`);
  assert(response.headers.get("Location") === "/", "open redirect was accepted");
});

if (process.exitCode) process.exit(process.exitCode);
