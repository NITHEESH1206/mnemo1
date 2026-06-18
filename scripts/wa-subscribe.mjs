// Subscribe the app to the WhatsApp Business Account's webhooks.
// Without this, Meta never forwards inbound messages to your webhook URL.
// Reads WHATSAPP_ACCESS_TOKEN from .env.local; discovers the WABA id via debug_token.

import { readFileSync } from "node:fs";

function loadEnv(path) {
  const env = {};
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2];
  }
  return env;
}

const env = loadEnv(new URL("../.env.local", import.meta.url));
const token = env.WHATSAPP_ACCESS_TOKEN;
const version = env.WHATSAPP_GRAPH_VERSION || "v21.0";
const base = `https://graph.facebook.com/${version}`;

// 1) Find the WABA id(s) this token is scoped to.
const dbg = await fetch(
  `${base}/debug_token?input_token=${token}&access_token=${token}`,
).then((r) => r.json());

const wabaIds = new Set();
const wabaArg = process.argv[2];
if (wabaArg) {
  wabaIds.add(wabaArg);
} else {
  const scopes = dbg?.data?.granular_scopes || [];
  for (const s of scopes) {
    if (/whatsapp_business/.test(s.scope)) {
      for (const id of s.target_ids || []) wabaIds.add(id);
    }
  }
}
console.log("WABA id(s) to subscribe:", [...wabaIds]);

if (wabaIds.size === 0) {
  console.error("No WABA id found in token scopes. Full debug:", JSON.stringify(dbg, null, 2));
  process.exit(1);
}

for (const waba of wabaIds) {
  // 2) Subscribe the app to this WABA.
  const sub = await fetch(`${base}/${waba}/subscribed_apps`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log(`\nPOST ${waba}/subscribed_apps →`, sub.status, await sub.text());

  // 3) Verify what's now subscribed.
  const list = await fetch(`${base}/${waba}/subscribed_apps`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log(`GET  ${waba}/subscribed_apps →`, list.status, await list.text());
}
