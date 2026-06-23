/**
 * Reminder store backed by Upstash Redis (HTTP, serverless-friendly).
 *
 * Key schema:
 *   reminder:<id>      JSON blob for one reminder
 *   due                ZSET — pending reminders only, score = fireAt unix ms
 *   user:<phone>       ZSET — all reminders for a user, score = fireAt unix ms
 *
 * Required env:
 *   UPSTASH_REDIS_REST_URL
 *   UPSTASH_REDIS_REST_TOKEN
 *
 * Get both from https://console.upstash.com → your Redis database → REST API tab.
 */

import { Redis } from "@upstash/redis";
import crypto from "crypto";
import type { Recurrence } from "./parser";

export type ReminderStatus = "pending" | "sent" | "cancelled";

export type Reminder = {
  id: string;
  userPhone: string; // who created it
  task: string;
  fireAt: string; // ISO timestamp
  recurrence: Recurrence;
  weekday?: number;
  status: ReminderStatus;
  createdAt: string;
  recipientPhone?: string; // friend-to-friend: who gets pinged (defaults to creator)
  recipientName?: string; // display name of the friend
  fireText?: string; // contextual "it's time to…" line, generated at creation
};

let cached: Redis | null = null;
function redis(): Redis {
  if (cached) return cached;
  if (
    !process.env.UPSTASH_REDIS_REST_URL ||
    !process.env.UPSTASH_REDIS_REST_TOKEN
  ) {
    throw new Error(
      "Missing UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN. Set them in .env.local (locally) or Vercel project settings (production).",
    );
  }
  cached = Redis.fromEnv();
  return cached;
}

const reminderKey = (id: string) => `reminder:${id}`;
const userKey = (phone: string) => `user:${phone}`;
const DUE_KEY = "due";

export async function createReminder(input: {
  userPhone: string;
  task: string;
  fireAt: Date;
  recurrence: Recurrence;
  weekday?: number;
  recipientPhone?: string;
  recipientName?: string;
  fireText?: string;
}): Promise<Reminder> {
  const id = crypto.randomBytes(8).toString("hex");
  const r: Reminder = {
    id,
    userPhone: input.userPhone,
    task: input.task,
    fireAt: input.fireAt.toISOString(),
    recurrence: input.recurrence,
    weekday: input.weekday,
    status: "pending",
    createdAt: new Date().toISOString(),
    recipientPhone: input.recipientPhone,
    recipientName: input.recipientName,
    fireText: input.fireText,
  };
  const ts = input.fireAt.getTime();
  const client = redis();
  await client.set(reminderKey(id), r);
  await client.zadd(DUE_KEY, { score: ts, member: id });
  await client.zadd(userKey(input.userPhone), { score: ts, member: id });
  return r;
}

export async function listForUser(
  userPhone: string,
  includeDone = false,
): Promise<Reminder[]> {
  const client = redis();
  const ids = (await client.zrange<string[]>(userKey(userPhone), 0, -1)) || [];
  if (ids.length === 0) return [];
  const keys = ids.map(reminderKey);
  const items = (await client.mget<Reminder[]>(...keys)) || [];
  const reminders = items
    .filter((x): x is Reminder => !!x)
    .filter((r) => includeDone || r.status === "pending");
  reminders.sort((a, b) => +new Date(a.fireAt) - +new Date(b.fireAt));
  return reminders;
}

export async function findDue(now: Date = new Date()): Promise<Reminder[]> {
  const client = redis();
  const ids =
    (await client.zrange<string[]>(DUE_KEY, 0, now.getTime(), {
      byScore: true,
    })) || [];
  if (ids.length === 0) return [];
  const items = (await client.mget<Reminder[]>(...ids.map(reminderKey))) || [];
  return items
    .filter((x): x is Reminder => !!x)
    .filter((r) => r.status === "pending");
}

export async function markSentOrReschedule(
  id: string,
  nextFireAt: Date | null,
): Promise<void> {
  const client = redis();
  const r = await client.get<Reminder>(reminderKey(id));
  if (!r) return;

  if (nextFireAt) {
    r.fireAt = nextFireAt.toISOString();
    r.status = "pending";
    const ts = nextFireAt.getTime();
    await client.set(reminderKey(id), r);
    await client.zadd(DUE_KEY, { score: ts, member: id });
    await client.zadd(userKey(r.userPhone), { score: ts, member: id });
  } else {
    r.status = "sent";
    await client.set(reminderKey(id), r);
    await client.zrem(DUE_KEY, id);
  }
}

export async function cancelReminderForUser(
  userPhone: string,
  indexOneBased: number,
): Promise<Reminder | null> {
  const pending = await listForUser(userPhone);
  const target = pending[indexOneBased - 1];
  if (!target) return null;
  const client = redis();
  const r = await client.get<Reminder>(reminderKey(target.id));
  if (!r) return null;
  r.status = "cancelled";
  await client.set(reminderKey(target.id), r);
  await client.zrem(DUE_KEY, target.id);
  return r;
}

export async function getReminderById(id: string): Promise<Reminder | null> {
  return (await redis().get<Reminder>(reminderKey(id))) ?? null;
}

/** Mark a reminder complete (done) — removes it from the due queue. */
export async function completeReminder(id: string): Promise<Reminder | null> {
  const client = redis();
  const r = await client.get<Reminder>(reminderKey(id));
  if (!r) return null;
  r.status = "sent";
  await client.set(reminderKey(id), r);
  await client.zrem(DUE_KEY, id);
  return r;
}

/** Push a reminder to a new time. */
export async function snoozeReminder(
  id: string,
  newDate: Date,
): Promise<Reminder | null> {
  const client = redis();
  const r = await client.get<Reminder>(reminderKey(id));
  if (!r) return null;
  r.fireAt = newDate.toISOString();
  r.status = "pending";
  const ts = newDate.getTime();
  await client.set(reminderKey(id), r);
  await client.zadd(DUE_KEY, { score: ts, member: id });
  await client.zadd(userKey(r.userPhone), { score: ts, member: id });
  return r;
}

/** Update an existing reminder's task / time / recurrence. */
export async function updateReminder(
  id: string,
  fields: {
    task?: string;
    fireAt?: Date;
    recurrence?: Recurrence;
    weekday?: number;
  },
): Promise<Reminder | null> {
  const client = redis();
  const r = await client.get<Reminder>(reminderKey(id));
  if (!r) return null;
  if (fields.task !== undefined) r.task = fields.task;
  if (fields.recurrence !== undefined) r.recurrence = fields.recurrence;
  if (fields.weekday !== undefined) r.weekday = fields.weekday;
  if (fields.fireAt) {
    r.fireAt = fields.fireAt.toISOString();
    r.status = "pending";
    const ts = fields.fireAt.getTime();
    await client.zadd(DUE_KEY, { score: ts, member: id });
    await client.zadd(userKey(r.userPhone), { score: ts, member: id });
  }
  await client.set(reminderKey(id), r);
  return r;
}

// Track the reminder most recently delivered to an address, so the recipient
// can reply "done" / "snooze" without a number.
const lastFiredKey = (addr: string) => `lastfired:${addr}`;

export async function setLastFired(addr: string, id: string): Promise<void> {
  await redis().set(lastFiredKey(addr), id, { ex: 60 * 60 * 24 });
}

export async function getLastFired(addr: string): Promise<string | null> {
  return (await redis().get<string>(lastFiredKey(addr))) ?? null;
}

// ── Contacts (for friend-to-friend reminders) ──────────────────
// Stored as a Redis hash per user: contacts:<userPhone> { name -> phone }

const contactsKey = (phone: string) => `contacts:${phone}`;

export async function addContact(
  ownerPhone: string,
  name: string,
  contactPhone: string,
): Promise<void> {
  await redis().hset(contactsKey(ownerPhone), {
    [name.toLowerCase()]: contactPhone,
  });
}

export async function getContacts(
  ownerPhone: string,
): Promise<Record<string, string>> {
  const all = await redis().hgetall<Record<string, string>>(
    contactsKey(ownerPhone),
  );
  return all ?? {};
}

export async function findContact(
  ownerPhone: string,
  name: string,
): Promise<string | null> {
  const all = await getContacts(ownerPhone);
  return all[name.toLowerCase()] ?? null;
}

export async function removeContact(
  ownerPhone: string,
  name: string,
): Promise<boolean> {
  const key = contactsKey(ownerPhone);
  const exists = await redis().hget(key, name.toLowerCase());
  if (exists === null || exists === undefined) return false;
  await redis().hdel(key, name.toLowerCase());
  return true;
}

// ── Subscriptions (payment log) ────────────────────────────────

export type Subscription = {
  plan: string;
  billing: string;
  email?: string;
  orderId: string;
  paymentId: string;
  amount: number;
  createdAt: string;
};

export async function recordSubscription(sub: Subscription): Promise<void> {
  const client = redis();
  await client.set(`subscription:${sub.orderId}`, sub);
  // Keep a chronological index for easy admin lookups.
  await client.zadd("subscriptions", {
    score: Date.now(),
    member: sub.orderId,
  });
}

// ── Plans, account linking & monthly usage ─────────────────────

// Temporarily "unlimited" for early access — set back to 20 to re-enable the free cap.
export const FREE_MONTHLY_LIMIT = 1_000_000;

// ── 7-day free trial (tracked per WhatsApp/Telegram/email address) ──
export const TRIAL_DAYS = 7;
const firstSeenKey = (addr: string) => `firstseen:${addr}`;

/** Timestamp (ms) the user first contacted us; sets it on first call. */
export async function ensureTrialStart(addr: string): Promise<number> {
  const existing = await redis().get<number>(firstSeenKey(addr));
  if (existing) return existing;
  const now = Date.now();
  await redis().set(firstSeenKey(addr), now);
  return now;
}

/** True once the 7-day trial window has elapsed since first contact. */
export async function isTrialExpired(addr: string): Promise<boolean> {
  const start = await ensureTrialStart(addr);
  return Date.now() > start + TRIAL_DAYS * 24 * 60 * 60 * 1000;
}

// ── User login records (web sign-in) ───────────────────────────
export type UserRecord = {
  email: string;
  name?: string;
  createdAt: string;
  lastLoginAt: string;
  logins: number;
};
const userInfoKey = (email: string) => `userinfo:${email.toLowerCase()}`;

/** Persist a web login: first-seen, last-seen, and a running login count. */
export async function recordUserLogin(
  email: string,
  name?: string,
): Promise<void> {
  const key = userInfoKey(email);
  const existing = await redis().get<UserRecord>(key);
  const now = new Date().toISOString();
  const rec: UserRecord = {
    email: email.toLowerCase(),
    name: name ?? existing?.name,
    createdAt: existing?.createdAt ?? now,
    lastLoginAt: now,
    logins: (existing?.logins ?? 0) + 1,
  };
  await redis().set(key, rec);
  await redis().sadd("useremails", email.toLowerCase());
}

export async function allUserEmails(): Promise<string[]> {
  return (await redis().smembers("useremails")) ?? [];
}

const planKey = (phone: string) => `plan:${phone}`;
const emailKey = (phone: string) => `email:${phone}`;
const linkTokenKey = (token: string) => `linktoken:${token}`;
const monthKey = (phone: string, ym: string) => `rcount:${phone}:${ym}`;

function yyyymm(d: Date = new Date()): string {
  return `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

/** Returns the plan name for a phone, or "free" if unlinked. */
export async function getPlan(phone: string): Promise<string> {
  return (await redis().get<string>(planKey(phone))) ?? "free";
}

export async function setPlan(
  phone: string,
  plan: string,
  email?: string,
): Promise<void> {
  await redis().set(planKey(phone), plan);
  if (email) await redis().set(emailKey(phone), email);
}

/** True for any paid tier (anything that isn't the free/Origin plan). */
export function isPaidPlan(plan: string): boolean {
  const p = plan.trim().toLowerCase();
  return p !== "" && p !== "free" && p !== "origin";
}

/** Create a one-time link code that activates a plan on a WhatsApp number. */
export async function createLinkToken(
  plan: string,
  email?: string,
): Promise<string> {
  const token = crypto.randomBytes(4).toString("hex").toUpperCase(); // 8 chars
  await redis().set(
    linkTokenKey(token),
    { plan, email: email ?? null },
    { ex: 60 * 60 * 24 }, // 24h
  );
  return token;
}

export async function consumeLinkToken(
  token: string,
): Promise<{ plan: string; email?: string } | null> {
  const key = linkTokenKey(token.trim().toUpperCase());
  const data = await redis().get<{ plan: string; email?: string }>(key);
  if (!data) return null;
  await redis().del(key);
  return data;
}

// ── Coupons (100%-off codes) ───────────────────────────────────
export type Coupon = {
  code: string;
  plan: string;
  maxUses: number; // 0 = unlimited
  uses: number;
  createdAt: string;
};
const couponKey = (code: string) => `coupon:${code.trim().toUpperCase()}`;
const couponUsedKey = (code: string, addr: string) =>
  `couponused:${code.trim().toUpperCase()}:${addr}`;

export async function createCoupon(
  code: string,
  plan: string,
  maxUses = 0,
): Promise<Coupon> {
  const c: Coupon = {
    code: code.trim().toUpperCase(),
    plan,
    maxUses,
    uses: 0,
    createdAt: new Date().toISOString(),
  };
  await redis().set(couponKey(code), c);
  return c;
}

export async function getCoupon(code: string): Promise<Coupon | null> {
  return (await redis().get<Coupon>(couponKey(code))) ?? null;
}

/** Redeem a coupon for an address (one redemption per address). */
export async function redeemCoupon(
  code: string,
  addr: string,
): Promise<{
  ok: boolean;
  reason?: "invalid" | "exhausted" | "already";
  plan?: string;
}> {
  const c = await getCoupon(code);
  if (!c) return { ok: false, reason: "invalid" };
  if (c.maxUses > 0 && c.uses >= c.maxUses)
    return { ok: false, reason: "exhausted", plan: c.plan };
  const used = await redis().get(couponUsedKey(c.code, addr));
  if (used) return { ok: false, reason: "already", plan: c.plan };
  await redis().set(couponUsedKey(c.code, addr), 1);
  c.uses += 1;
  await redis().set(couponKey(c.code), c);
  return { ok: true, plan: c.plan };
}

export async function getMonthlyCount(phone: string): Promise<number> {
  const c = await redis().get<number>(monthKey(phone, yyyymm()));
  return c ?? 0;
}

export async function incrMonthlyCount(phone: string): Promise<number> {
  const key = monthKey(phone, yyyymm());
  const n = await redis().incr(key);
  if (n === 1) await redis().expire(key, 60 * 60 * 24 * 40); // ~40 days
  return n;
}

// ── Active users (for the digest) ──────────────────────────────
export async function registerUser(addr: string): Promise<void> {
  await redis().sadd("users", addr);
}
export async function allUsers(): Promise<string[]> {
  return (await redis().smembers("users")) ?? [];
}

// ── Referrals ──────────────────────────────────────────────────
const refCodeKey = (addr: string) => `refcode:${addr}`;
const refOwnerKey = (code: string) => `refowner:${code.toUpperCase()}`;
const refCountKey = (addr: string) => `refcount:${addr}`;
const refByKey = (addr: string) => `refby:${addr}`;

/** Get (or create) this user's shareable referral code. */
export async function getOrCreateRefCode(addr: string): Promise<string> {
  const existing = await redis().get<string>(refCodeKey(addr));
  if (existing) return existing;
  const code = crypto.randomBytes(3).toString("hex").toUpperCase(); // 6 chars
  await redis().set(refCodeKey(addr), code);
  await redis().set(refOwnerKey(code), addr);
  return code;
}

export async function getReferralCount(addr: string): Promise<number> {
  return (await redis().get<number>(refCountKey(addr))) ?? 0;
}

/** Credit a referral when a new user redeems someone's code (once per user). */
export async function creditReferral(
  code: string,
  newAddr: string,
): Promise<{ ok: boolean; referrer?: string; count?: number }> {
  const referrer = await redis().get<string>(refOwnerKey(code));
  if (!referrer || referrer === newAddr) return { ok: false };
  if (await redis().get(refByKey(newAddr))) return { ok: false }; // already referred
  await redis().set(refByKey(newAddr), referrer);
  const count = await redis().incr(refCountKey(referrer));
  return { ok: true, referrer, count };
}

// ── Context / place reminders ("when I get home") ──────────────
const ctxKey = (addr: string, place: string) =>
  `ctxrem:${addr}:${place.toLowerCase()}`;

export async function addContextReminder(
  addr: string,
  place: string,
  task: string,
): Promise<void> {
  await redis().rpush(ctxKey(addr, place), task);
}

/** Return AND clear all reminders queued for a place (e.g. "home"). */
export async function popContextReminders(
  addr: string,
  place: string,
): Promise<string[]> {
  const key = ctxKey(addr, place);
  const items = (await redis().lrange<string>(key, 0, -1)) ?? [];
  if (items.length) await redis().del(key);
  return items;
}

// ── Stats counters (for the admin stats page) ──────────────────
export async function countBotUsers(): Promise<number> {
  return (await redis().scard("users")) ?? 0;
}
export async function countWebUsers(): Promise<number> {
  return (await redis().scard("useremails")) ?? 0;
}
export async function countSubscriptions(): Promise<number> {
  return (await redis().zcard("subscriptions")) ?? 0;
}

const digestKey = (addr: string, ymd: string) => `digest:${addr}:${ymd}`;
export async function wasDigestSent(
  addr: string,
  ymd: string,
): Promise<boolean> {
  return (await redis().get(digestKey(addr, ymd))) !== null;
}
export async function markDigestSent(addr: string, ymd: string): Promise<void> {
  await redis().set(digestKey(addr, ymd), 1, { ex: 60 * 60 * 36 });
}

// ── Per-user timezone (IANA name) ──────────────────────────────
const tzKey = (addr: string) => `tz:${addr}`;
export async function getUserZone(addr: string): Promise<string> {
  return (await redis().get<string>(tzKey(addr))) ?? "Asia/Kolkata";
}
export async function setUserZone(addr: string, zone: string): Promise<void> {
  await redis().set(tzKey(addr), zone);
}

// ── Email ↔ phone link (for the web dashboard) ─────────────────
const phoneByEmailKey = (email: string) => `phoneByEmail:${email.toLowerCase()}`;
export async function setPhoneForEmail(
  email: string,
  phone: string,
): Promise<void> {
  await redis().set(phoneByEmailKey(email), phone);
}
export async function getPhoneForEmail(
  email: string,
): Promise<string | null> {
  return (await redis().get<string>(phoneByEmailKey(email))) ?? null;
}

// ── Lists (shopping list, etc.) ────────────────────────────────
const listKey = (addr: string, name: string) =>
  `list:${addr}:${name.toLowerCase()}`;
const listsSetKey = (addr: string) => `lists:${addr}`;

export async function addToList(
  addr: string,
  name: string,
  item: string,
): Promise<void> {
  const client = redis();
  await client.rpush(listKey(addr, name), item);
  await client.sadd(listsSetKey(addr), name.toLowerCase());
}
export async function getList(addr: string, name: string): Promise<string[]> {
  return (await redis().lrange<string>(listKey(addr, name), 0, -1)) ?? [];
}
export async function removeFromList(
  addr: string,
  name: string,
  item: string,
): Promise<boolean> {
  const items = await getList(addr, name);
  const match = items.find((x) => x.toLowerCase() === item.toLowerCase());
  if (!match) return false;
  await redis().lrem(listKey(addr, name), 1, match);
  return true;
}
export async function clearList(addr: string, name: string): Promise<void> {
  const client = redis();
  await client.del(listKey(addr, name));
  await client.srem(listsSetKey(addr), name.toLowerCase());
}
export async function allListNames(addr: string): Promise<string[]> {
  return (await redis().smembers(listsSetKey(addr))) ?? [];
}
