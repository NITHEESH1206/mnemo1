/**
 * Notion OAuth + page saving (the "memory trunk").
 *
 * Stores, per user, the OAuth token (`notion:<phone>`) and a discovered save
 * target (`notion:target:<phone>`) — either a database the user shared or a
 * page to nest items under.
 *
 * Required env:
 *   NOTION_CLIENT_ID
 *   NOTION_CLIENT_SECRET
 *   NOTION_REDIRECT_URI   e.g. https://mnemo12.vercel.app/api/auth/notion/callback
 */

import { Redis } from "@upstash/redis";
import { buildState, verifyState } from "./google";

const NOTION_VERSION = "2022-06-28";

let redisCache: Redis | null = null;
function redis(): Redis {
  if (redisCache) return redisCache;
  if (
    !process.env.UPSTASH_REDIS_REST_URL ||
    !process.env.UPSTASH_REDIS_REST_TOKEN
  ) {
    throw new Error("Upstash env vars missing");
  }
  redisCache = Redis.fromEnv();
  return redisCache;
}

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing ${name}. Set it in env vars.`);
  return v;
}

const tokenKey = (phone: string) => `notion:${phone}`;
const targetKey = (phone: string) => `notion:target:${phone}`;

type NotionToken = { access_token: string; workspace_name?: string };
type NotionTarget =
  | { type: "database"; id: string; titleProp: string }
  | { type: "page"; id: string };

export function notionAuthUrl(phone: string): string {
  const params = new URLSearchParams({
    client_id: requireEnv("NOTION_CLIENT_ID"),
    response_type: "code",
    owner: "user",
    redirect_uri: requireEnv("NOTION_REDIRECT_URI"),
    state: buildState(phone),
  });
  return `https://api.notion.com/v1/oauth/authorize?${params.toString()}`;
}

export function verifyNotionState(state: string): string | null {
  return verifyState(state);
}

export async function exchangeNotionCode(
  code: string,
): Promise<NotionToken> {
  const basic = Buffer.from(
    `${requireEnv("NOTION_CLIENT_ID")}:${requireEnv("NOTION_CLIENT_SECRET")}`,
  ).toString("base64");
  const res = await fetch("https://api.notion.com/v1/oauth/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/json",
      "Notion-Version": NOTION_VERSION,
    },
    body: JSON.stringify({
      grant_type: "authorization_code",
      code,
      redirect_uri: requireEnv("NOTION_REDIRECT_URI"),
    }),
  });
  if (!res.ok) {
    throw new Error(`Notion token exchange failed: ${res.status} ${await res.text()}`);
  }
  const data = (await res.json()) as {
    access_token: string;
    workspace_name?: string;
  };
  return { access_token: data.access_token, workspace_name: data.workspace_name };
}

export async function saveNotionToken(
  phone: string,
  token: NotionToken,
): Promise<void> {
  await redis().set(tokenKey(phone), token);
}

export async function getNotionToken(
  phone: string,
): Promise<NotionToken | null> {
  return (await redis().get<NotionToken>(tokenKey(phone))) ?? null;
}

export async function clearNotion(phone: string): Promise<void> {
  await redis().del(tokenKey(phone));
  await redis().del(targetKey(phone));
}

function headers(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    "Notion-Version": NOTION_VERSION,
  };
}

/** Find (and cache) a place to save items: a shared database, else a page. */
async function resolveTarget(
  phone: string,
  token: string,
): Promise<NotionTarget | null> {
  const cached = await redis().get<NotionTarget>(targetKey(phone));
  if (cached) return cached;

  // Prefer a database
  const dbRes = await fetch("https://api.notion.com/v1/search", {
    method: "POST",
    headers: headers(token),
    body: JSON.stringify({
      filter: { property: "object", value: "database" },
      page_size: 1,
    }),
  });
  if (dbRes.ok) {
    const data = (await dbRes.json()) as {
      results?: Array<{
        id: string;
        properties?: Record<string, { type?: string }>;
      }>;
    };
    const db = data.results?.[0];
    if (db) {
      const titleProp =
        Object.entries(db.properties ?? {}).find(
          ([, v]) => v.type === "title",
        )?.[0] || "Name";
      const target: NotionTarget = { type: "database", id: db.id, titleProp };
      await redis().set(targetKey(phone), target);
      return target;
    }
  }

  // Else nest under a page
  const pageRes = await fetch("https://api.notion.com/v1/search", {
    method: "POST",
    headers: headers(token),
    body: JSON.stringify({
      filter: { property: "object", value: "page" },
      page_size: 1,
    }),
  });
  if (pageRes.ok) {
    const data = (await pageRes.json()) as {
      results?: Array<{ id: string }>;
    };
    const page = data.results?.[0];
    if (page) {
      const target: NotionTarget = { type: "page", id: page.id };
      await redis().set(targetKey(phone), target);
      return target;
    }
  }

  return null;
}

export type NotionSaveResult =
  | { ok: true }
  | { ok: false; reason: "not_connected" | "no_target" | "error" };

export async function notionSave(
  phone: string,
  title: string,
  detail?: string,
): Promise<NotionSaveResult> {
  const token = await getNotionToken(phone);
  if (!token) return { ok: false, reason: "not_connected" };

  try {
    const target = await resolveTarget(phone, token.access_token);
    if (!target) return { ok: false, reason: "no_target" };

    const children = detail
      ? [
          {
            object: "block",
            type: "paragraph",
            paragraph: {
              rich_text: [{ type: "text", text: { content: detail } }],
            },
          },
        ]
      : [];

    const body =
      target.type === "database"
        ? {
            parent: { database_id: target.id },
            properties: {
              [target.titleProp]: {
                title: [{ text: { content: title } }],
              },
            },
            children,
          }
        : {
            parent: { page_id: target.id },
            properties: {
              title: { title: [{ text: { content: title } }] },
            },
            children,
          };

    const res = await fetch("https://api.notion.com/v1/pages", {
      method: "POST",
      headers: headers(token.access_token),
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      console.error("[notion] page create failed", res.status, await res.text());
      return { ok: false, reason: "error" };
    }
    return { ok: true };
  } catch (e) {
    console.error("[notion] save error", e);
    return { ok: false, reason: "error" };
  }
}
