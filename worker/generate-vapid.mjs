// Run locally. The private key is written ONLY to a gitignored file, never stdout.
import { writeFileSync } from "node:fs";
import { encodeBase64Url } from "./web-push.js";

const subject = process.argv[2];
let validSubject = false;
try {
  const url = new URL(subject);
  validSubject = (url.protocol === "mailto:" && url.pathname.includes("@"))
    || (url.protocol === "https:" && Boolean(url.hostname) && !url.username && !url.password);
} catch { /* Reject malformed contact identifiers without generating keys. */ }
if (!validSubject) {
  console.error('Usage: node worker/generate-vapid.mjs "mailto:YOUR_EMAIL"');
  process.exit(1);
}
const pair = await crypto.subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, true, ["sign", "verify"]);
const publicKey = encodeBase64Url(await crypto.subtle.exportKey("raw", pair.publicKey));
const privateJwk = await crypto.subtle.exportKey("jwk", pair.privateKey);
const destination = new URL("../.dev.vars.vapid", import.meta.url);
try {
  writeFileSync(destination, [
    "# Private local file. Do not commit, upload, or paste into chat.",
    `LIMINAL_VAPID_PUBLIC_KEY=${JSON.stringify(publicKey)}`,
    `LIMINAL_VAPID_PRIVATE_KEY=${JSON.stringify(privateJwk.d)}`,
    `LIMINAL_VAPID_SUBJECT=${JSON.stringify(subject)}`, ""
  ].join("\n"), { flag: "wx", mode: 0o600 });
  console.log("VAPID keys saved to .dev.vars.vapid (gitignored). No key values were printed.");
  console.log("Open that file locally and configure the three values in Cloudflare. Do not share the private key.");
} catch (error) {
  if (error.code === "EEXIST") console.error(".dev.vars.vapid already exists. Existing keys were not changed.");
  else console.error("Unable to save the local VAPID file.");
  process.exitCode = 1;
}
