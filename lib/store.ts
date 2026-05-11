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
  userPhone: string;
  task: string;
  fireAt: string; // ISO timestamp
  recurrence: Recurrence;
  weekday?: number;
  status: ReminderStatus;
  createdAt: string;
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
