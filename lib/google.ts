/**
 * Google OAuth + Calendar integration.
 *
 * Per user, we store an OAuth token bundle in Upstash keyed by their
 * WhatsApp phone (`oauth:google:<userPhone>`). Access tokens auto-refresh.
 *
 * Required env:
 *   GOOGLE_CLIENT_ID
 *   GOOGLE_CLIENT_SECRET
 *   GOOGLE_REDIRECT_URI       e.g. https://mnemo12.vercel.app/api/auth/google/callback
 */

import { google } from "googleapis";
import type { Credentials, OAuth2Client } from "google-auth-library";
import { Redis } from "@upstash/redis";
import crypto from "crypto";

export type GoogleTokens = Credentials & { email?: string };

const SCOPES = [
  "openid",
  "email",
  "profile",
  "https://www.googleapis.com/auth/calendar.events",
];

// Lighter scopes for plain web sign-in (no calendar access needed).
const LOGIN_SCOPES = ["openid", "email", "profile"];

const SESSION_COOKIE = "mnemo_session";

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
  if (!v) {
    throw new Error(
      `Missing ${name}. Set it in Vercel env vars (or .env.local locally).`,
    );
  }
  return v;
}

/** Build a new OAuth client with our app's credentials. */
export function oauthClient(): OAuth2Client {
  return new google.auth.OAuth2(
    requireEnv("GOOGLE_CLIENT_ID"),
    requireEnv("GOOGLE_CLIENT_SECRET"),
    requireEnv("GOOGLE_REDIRECT_URI"),
  );
}

const tokenKey = (phone: string) => `oauth:google:${phone}`;

/**
 * Build a signed state token to round-trip the user's phone through Google's
 * OAuth redirect safely. We use an HMAC so an attacker can't forge a state
 * that maps to a different user's phone.
 */
export function buildState(phone: string): string {
  const secret =
    process.env.CRON_SECRET || requireEnv("GOOGLE_CLIENT_SECRET");
  const payload = Buffer.from(phone).toString("base64url");
  const sig = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("base64url")
    .slice(0, 24);
  return `${payload}.${sig}`;
}

export function verifyState(state: string): string | null {
  const [payload, sig] = state.split(".");
  if (!payload || !sig) return null;
  const secret =
    process.env.CRON_SECRET || requireEnv("GOOGLE_CLIENT_SECRET");
  const expected = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("base64url")
    .slice(0, 24);
  if (sig !== expected) return null;
  try {
    return Buffer.from(payload, "base64url").toString("utf-8");
  } catch {
    return null;
  }
}

/** Generate a consent screen URL for the user to grant Calendar access. */
export function authUrl(phone: string): string {
  const client = oauthClient();
  return client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent", // force refresh_token issuance every time
    include_granted_scopes: true,
    scope: SCOPES,
    state: buildState(phone),
  });
}

/**
 * Generate a sign-in (login/signup) consent URL — email + profile only.
 * `dest` controls where the callback sends the user after sign-in:
 *   "wa"   → WhatsApp (the "Try for Free" funnel)
 *   else   → the web dashboard ("Log in")
 */
export function authUrlForLogin(dest?: string): string {
  const client = oauthClient();
  const statePayload = dest === "wa" ? "login:wa" : "login";
  return client.generateAuthUrl({
    access_type: "online",
    prompt: "select_account",
    scope: LOGIN_SCOPES,
    state: buildState(statePayload),
  });
}

// ── Minimal signed session cookie (web login) ──────────────────
function sessionSecret(): string {
  return (
    process.env.GOOGLE_CLIENT_SECRET ||
    process.env.CRON_SECRET ||
    "mnemo-dev-secret"
  );
}

export function signSession(email: string): string {
  const payload = Buffer.from(
    JSON.stringify({ email, t: Date.now() }),
  ).toString("base64url");
  const sig = crypto
    .createHmac("sha256", sessionSecret())
    .update(payload)
    .digest("base64url")
    .slice(0, 24);
  return `${payload}.${sig}`;
}

export function readSession(
  cookieValue: string | undefined,
): { email: string } | null {
  if (!cookieValue) return null;
  const [payload, sig] = cookieValue.split(".");
  if (!payload || !sig) return null;
  const expected = crypto
    .createHmac("sha256", sessionSecret())
    .update(payload)
    .digest("base64url")
    .slice(0, 24);
  if (sig !== expected) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString());
    return { email: data.email };
  } catch {
    return null;
  }
}

export const SESSION_COOKIE_NAME = SESSION_COOKIE;

/** Exchange an authorization code for tokens + the user's email. */
export async function exchangeCodeForTokens(
  code: string,
): Promise<GoogleTokens> {
  const client = oauthClient();
  const { tokens } = await client.getToken(code);

  // Look up the user's primary email so we can show it back.
  let email: string | undefined;
  try {
    client.setCredentials(tokens);
    const oauth2 = google.oauth2({ version: "v2", auth: client });
    const info = await oauth2.userinfo.get();
    email = info.data.email ?? undefined;
  } catch {
    // Non-fatal — we can still proceed without the email.
  }

  return { ...tokens, email };
}

export async function saveTokens(
  phone: string,
  tokens: GoogleTokens,
): Promise<void> {
  await redis().set(tokenKey(phone), tokens);
}

export async function getTokens(
  phone: string,
): Promise<GoogleTokens | null> {
  return (await redis().get<GoogleTokens>(tokenKey(phone))) ?? null;
}

export async function clearTokens(phone: string): Promise<void> {
  await redis().del(tokenKey(phone));
}

/**
 * Return an OAuth2 client that's already loaded with a user's tokens and
 * will auto-refresh / persist on refresh.
 */
export async function authedClientFor(
  phone: string,
): Promise<OAuth2Client | null> {
  const tokens = await getTokens(phone);
  if (!tokens) return null;
  const client = oauthClient();
  client.setCredentials(tokens);

  // Persist refreshed tokens automatically.
  client.on("tokens", async (newTokens) => {
    const merged: GoogleTokens = {
      ...tokens,
      ...newTokens,
      // Always keep the refresh_token (Google doesn't re-send it on refresh).
      refresh_token: newTokens.refresh_token ?? tokens.refresh_token,
    };
    await saveTokens(phone, merged);
  });

  return client;
}

// ---------------------------------------------------------------
// Calendar event creation (with auto Google Meet link)
// ---------------------------------------------------------------

export type CalendarEventInput = {
  summary: string;
  description?: string;
  startISO: string;
  durationMinutes?: number; // default 60
  attendeeEmails?: string[];
  timeZone?: string; // default Asia/Kolkata
};

export type CreatedEvent = {
  htmlLink: string;
  meetLink?: string;
  eventId: string;
};

export async function createCalendarEvent(
  phone: string,
  input: CalendarEventInput,
): Promise<CreatedEvent> {
  const auth = await authedClientFor(phone);
  if (!auth) {
    throw new Error("not_connected");
  }
  const calendar = google.calendar({ version: "v3", auth });

  const start = new Date(input.startISO);
  const end = new Date(
    start.getTime() + (input.durationMinutes ?? 60) * 60_000,
  );
  const tz = input.timeZone || process.env.TIMEZONE_NAME || "Asia/Kolkata";

  const requestId = `mnemo-${crypto.randomBytes(6).toString("hex")}`;

  const res = await calendar.events.insert({
    calendarId: "primary",
    conferenceDataVersion: 1,
    requestBody: {
      summary: input.summary,
      description:
        (input.description ?? "") + "\n\n(created by Feru AI)",
      start: { dateTime: start.toISOString(), timeZone: tz },
      end: { dateTime: end.toISOString(), timeZone: tz },
      attendees: input.attendeeEmails?.map((email) => ({ email })),
      conferenceData: {
        createRequest: {
          requestId,
          conferenceSolutionKey: { type: "hangoutsMeet" },
        },
      },
      reminders: { useDefault: true },
    },
  });

  const ev = res.data;
  const meetEntry = ev.conferenceData?.entryPoints?.find(
    (e) => e.entryPointType === "video",
  );

  return {
    htmlLink: ev.htmlLink || "",
    meetLink: meetEntry?.uri || undefined,
    eventId: ev.id || "",
  };
}
