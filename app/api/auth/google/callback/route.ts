import { NextRequest, NextResponse } from "next/server";
import {
  exchangeCodeForTokens,
  saveTokens,
  verifyState,
  signSession,
  SESSION_COOKIE_NAME,
} from "@/lib/google";
import { sendWhatsApp } from "@/lib/twilio";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const err = req.nextUrl.searchParams.get("error");

  if (err) {
    return resultPage(`Google sign-in was cancelled (${err}).`, false);
  }
  if (!code || !state) {
    return resultPage("Missing required OAuth parameters.", false);
  }

  const decoded = verifyState(state);
  if (!decoded) {
    return resultPage(
      "Invalid sign-in state. Please start again.",
      false,
    );
  }

  // ── Web login / signup flow → send them to pricing ───────
  if (decoded === "login") {
    try {
      const tokens = await exchangeCodeForTokens(code);
      const email = tokens.email ?? "your Google account";

      const base =
        process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "") ||
        req.nextUrl.origin;
      const res = NextResponse.redirect(`${base}/pricing?welcome=1`);
      res.cookies.set(SESSION_COOKIE_NAME, signSession(email), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
      return res;
    } catch (e) {
      console.error("[auth/google/callback] login error", e);
      return resultPage("Sign-in failed. Please try again.", false);
    }
  }

  // ── Calendar connect flow (decoded === "whatsapp:+...") ──
  const phone = decoded;
  try {
    const tokens = await exchangeCodeForTokens(code);
    await saveTokens(phone, tokens);

    try {
      await sendWhatsApp({
        to: phone,
        body: `google calendar connected${tokens.email ? ` (${tokens.email})` : ""}.\n\ntry: "meet with ashok tomorrow at 11am" and i'll auto-create the event + meet link.`,
      });
    } catch (twilioErr) {
      console.error("[auth/google/callback] twilio send failed", twilioErr);
    }

    return resultPage(
      `Connected as ${tokens.email ?? "your Google account"}. You can close this tab and head back to WhatsApp.`,
      true,
    );
  } catch (e) {
    console.error("[auth/google/callback] error", e);
    return resultPage(
      "Something went wrong while connecting your Google account. Please try again.",
      false,
    );
  }
}

function resultPage(message: string, ok: boolean): NextResponse {
  const accent = ok ? "#16a34a" : "#dc2626";
  const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Mnemo</title><style>
    body { background: #fff8f0; color: #0c0a09; font: 16px/1.6 system-ui, -apple-system, sans-serif; min-height: 100vh; display: grid; place-items: center; padding: 24px; margin: 0; }
    .card { background: #fff; border: 1px solid rgba(15,12,9,0.08); border-radius: 24px; padding: 36px; max-width: 460px; box-shadow: 0 20px 60px -20px rgba(120, 53, 15, 0.2); text-align: center; }
    .dot { width: 14px; height: 14px; border-radius: 9999px; background: ${accent}; margin: 0 auto 14px; box-shadow: 0 0 22px ${accent}aa; }
    h1 { margin: 0 0 12px; font-size: 22px; }
    p { margin: 0; color: rgba(12,10,9,0.7); }
  </style></head><body><div class="card"><div class="dot"></div><h1>${ok ? "All set." : "Hold on."}</h1><p>${message}</p></div></body></html>`;
  return new NextResponse(html, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
