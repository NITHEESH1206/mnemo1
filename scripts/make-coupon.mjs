// One-off: create a coupon in the live Upstash Redis.
// Usage: node scripts/make-coupon.mjs NNKSIUU pro 0
import { readFileSync } from "node:fs";
import { Redis } from "@upstash/redis";

// Load UPSTASH_* from .env.local
for (const line of readFileSync(new URL("../.env.local", import.meta.url), "utf8").split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}

const code = (process.argv[2] || "NNKSIUU").trim().toUpperCase();
const plan = (process.argv[3] || "pro").trim();
const maxUses = parseInt(process.argv[4] || "0", 10);

const redis = Redis.fromEnv();
const c = { code, plan, maxUses, uses: 0, createdAt: new Date().toISOString() };
await redis.set(`coupon:${code}`, c);
console.log("created coupon:", await redis.get(`coupon:${code}`));
