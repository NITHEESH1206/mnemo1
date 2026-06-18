// Verify the app's webhook subscription (callback URL + fields + active).
// Needs WHATSAPP_ACCESS_TOKEN + WHATSAPP_APP_SECRET in .env.local.

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
const secret = env.WHATSAPP_APP_SECRET;
const version = env.WHATSAPP_GRAPH_VERSION || "v21.0";
const base = `https://graph.facebook.com/${version}`;

if (!secret) {
  console.error("Add WHATSAPP_APP_SECRET to .env.local first.");
  process.exit(1);
}

// Get the app id from the token.
const dbg = await fetch(
  `${base}/debug_token?input_token=${token}&access_token=${token}`,
).then((r) => r.json());
const appId = dbg?.data?.app_id;
console.log("App id:", appId);

const appToken = `${appId}|${secret}`;

// What webhook objects/fields is this app subscribed to, and on what URL?
const subs = await fetch(
  `${base}/${appId}/subscriptions?access_token=${appToken}`,
).then((r) => r.json());
console.log("\nApp subscriptions:\n", JSON.stringify(subs, null, 2));
