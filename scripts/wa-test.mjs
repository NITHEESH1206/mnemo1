// Direct WhatsApp Cloud API send test.
// Usage: node scripts/wa-test.mjs <recipient-number-with-country-code>
// Reads WHATSAPP_ACCESS_TOKEN + WHATSAPP_PHONE_NUMBER_ID from .env.local.

import { readFileSync } from "node:fs";

function loadEnv(path) {
  const env = {};
  const txt = readFileSync(path, "utf8");
  for (const line of txt.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2];
  }
  return env;
}

const env = loadEnv(new URL("../.env.local", import.meta.url));
const token = env.WHATSAPP_ACCESS_TOKEN;
const phoneId = process.argv[3] || env.WHATSAPP_PHONE_NUMBER_ID;
const version = env.WHATSAPP_GRAPH_VERSION || "v21.0";
const to = (process.argv[2] || "").replace(/\D/g, "");
const phoneIdOverride = process.argv[3];

console.log("Phone number ID:", phoneId);
console.log("Token present:", token ? `yes (${token.length} chars)` : "NO");
console.log("Sending to:", to || "(missing — pass a number as the argument)");

if (!token || !phoneId || !to) {
  console.error("\nMissing token, phone id, or recipient. Aborting.");
  process.exit(1);
}

const res = await fetch(
  `https://graph.facebook.com/${version}/${phoneId}/messages`,
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { preview_url: false, body: "Direct API test from Feru AI ✅" },
    }),
  },
);

console.log("\nHTTP status:", res.status);
console.log("Response:", await res.text());
