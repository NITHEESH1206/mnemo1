/**
 * Microsoft Graph OAuth + Calendar (Outlook + Teams).
 *
 * Tokens stored per user in Upstash: `oauth:ms:<phone>`.
 * Reuses the signed-state helpers from lib/google.ts.
 *
 * Required env:
 *   MICROSOFT_CLIENT_ID
 *   MICROSOFT_CLIENT_SECRET
 *   MICROSOFT_REDIRECT_URI    e.g. https://mnemo12.vercel.app/api/auth/microsoft/callback
 *   MICROSOFT_TENANT          optional, defaults to "common"
 */

import { Redis } from "@upstash/redis";
import { buildState, verifyState } from "./google";

const SCOPES = [
  "offline_access",
  "openid",
  "email",
  "profile",
  "Calendars.ReadWrite",
  "User.Read",
];

export type MsTokens = {
  access_token: string;
  refresh_token?: string;
  expires_at: number; // epoch ms
  email?: string;
};

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

function tenant(): string {
  return process.env.MICROSOFT_TENANT || "common";
}

const tokenKey = (phone: string) => `oauth:ms:${phone}`;

export function msAuthUrl(phone: string): string {
  const params = new URLSearchParams({
    client_id: requireEnv("MICROSOFT_CLIENT_ID"),
    response_type: "code",
    redirect_uri: requireEnv("MICROSOFT_REDIRECT_URI"),
    response_mode: "query",
    scope: SCOPES.join(" "),
    state: buildState(phone),
  });
  return `https://login.microsoftonline.com/${tenant()}/oauth2/v2.0/authorize?${params.toString()}`;
}

export function verifyMsState(state: string): string | null {
  return verifyState(state);
}

async function tokenRequest(
  body: Record<string, string>,
): Promise<MsTokens> {
  const res = await fetch(
    `https://login.microsoftonline.com/${tenant()}/oauth2/v2.0/token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: requireEnv("MICROSOFT_CLIENT_ID"),
        client_secret: requireEnv("MICROSOFT_CLIENT_SECRET"),
        redirect_uri: requireEnv("MICROSOFT_REDIRECT_URI"),
        scope: SCOPES.join(" "),
        ...body,
      }),
    },
  );
  if (!res.ok) {
    throw new Error(`Microsoft token request failed: ${res.status} ${await res.text()}`);
  }
  const data = (await res.json()) as {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
  };
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Date.now() + (data.expires_in - 60) * 1000,
  };
}

export async function exchangeMsCode(code: string): Promise<MsTokens> {
  const tokens = await tokenRequest({
    grant_type: "authorization_code",
    code,
  });
  // Fetch email (best effort)
  try {
    const me = await fetch("https://graph.microsoft.com/v1.0/me", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    if (me.ok) {
      const data = (await me.json()) as {
        mail?: string;
        userPrincipalName?: string;
      };
      tokens.email = data.mail || data.userPrincipalName;
    }
  } catch {
    /* non-fatal */
  }
  return tokens;
}

export async function saveMsTokens(
  phone: string,
  tokens: MsTokens,
): Promise<void> {
  await redis().set(tokenKey(phone), tokens);
}

export async function getMsTokens(phone: string): Promise<MsTokens | null> {
  return (await redis().get<MsTokens>(tokenKey(phone))) ?? null;
}

export async function clearMsTokens(phone: string): Promise<void> {
  await redis().del(tokenKey(phone));
}

/** Returns a valid access token, refreshing + persisting if expired. */
async function freshAccessToken(phone: string): Promise<string | null> {
  const tokens = await getMsTokens(phone);
  if (!tokens) return null;
  if (Date.now() < tokens.expires_at) return tokens.access_token;
  if (!tokens.refresh_token) return null;

  const refreshed = await tokenRequest({
    grant_type: "refresh_token",
    refresh_token: tokens.refresh_token,
  });
  const merged: MsTokens = {
    ...tokens,
    ...refreshed,
    refresh_token: refreshed.refresh_token ?? tokens.refresh_token,
  };
  await saveMsTokens(phone, merged);
  return merged.access_token;
}

export type CreatedOutlookEvent = {
  webLink?: string;
  joinUrl?: string;
};

export async function createOutlookEvent(
  phone: string,
  input: {
    summary: string;
    startISO: string;
    durationMinutes?: number;
    timeZone?: string;
  },
): Promise<CreatedOutlookEvent> {
  const access = await freshAccessToken(phone);
  if (!access) throw new Error("not_connected");

  const start = new Date(input.startISO);
  const end = new Date(
    start.getTime() + (input.durationMinutes ?? 60) * 60_000,
  );
  const tz = input.timeZone || process.env.TIMEZONE_NAME || "Asia/Kolkata";

  const makeBody = (online: boolean) => ({
    subject: input.summary,
    start: { dateTime: start.toISOString(), timeZone: "UTC" },
    end: { dateTime: end.toISOString(), timeZone: "UTC" },
    ...(online
      ? { isOnlineMeeting: true, onlineMeetingProvider: "teamsForBusiness" }
      : {}),
  });

  // Try with a Teams meeting; if the account can't (e.g. personal Outlook),
  // fall back to a plain calendar event.
  let res = await fetch("https://graph.microsoft.com/v1.0/me/events", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${access}`,
      "Content-Type": "application/json",
      Prefer: `outlook.timezone="${tz}"`,
    },
    body: JSON.stringify(makeBody(true)),
  });

  if (!res.ok) {
    res = await fetch("https://graph.microsoft.com/v1.0/me/events", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${access}`,
        "Content-Type": "application/json",
        Prefer: `outlook.timezone="${tz}"`,
      },
      body: JSON.stringify(makeBody(false)),
    });
  }

  if (!res.ok) {
    throw new Error(`Graph event create failed: ${res.status} ${await res.text()}`);
  }

  const data = (await res.json()) as {
    webLink?: string;
    onlineMeeting?: { joinUrl?: string };
  };
  return { webLink: data.webLink, joinUrl: data.onlineMeeting?.joinUrl };
}
