import { NextRequest, NextResponse } from "next/server";
import {
  exchangeCodeForTokens,
  saveTokens,
  verifyState,
  signSession,
  SESSION_COOKIE_NAME,
} from "@/lib/google";
import { sendWhatsApp } from "@/lib/twilio";
import { whatsappCTAUrl } from "@/lib/whatsapp";

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

  // ── Web login / signup flow ──────────────────────────────
  if (decoded === "login") {
    try {
      const tokens = await exchangeCodeForTokens(code);
      const email = tokens.email ?? "your Google account";
      const res = loginSuccessPage(email);
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

function loginSuccessPage(email: string): NextResponse {
  const wa = whatsappCTAUrl("Hi Mnemo! I just signed in — let's get started.");
  const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Welcome to Mnemo</title><style>
    body { background: linear-gradient(180deg,#1a86e0,#4fb0f2 55%,#fff8f0); color: #0c0a09; font: 16px/1.6 system-ui, -apple-system, sans-serif; min-height: 100vh; display: grid; place-items: center; padding: 24px; margin: 0; }
    .card { background: rgba(255,255,255,0.7); backdrop-filter: blur(28px) saturate(180%); -webkit-backdrop-filter: blur(28px) saturate(180%); border: 1px solid rgba(255,255,255,0.8); border-radius: 28px; padding: 40px 34px; max-width: 460px; box-shadow: 0 30px 80px -28px rgba(20,60,110,0.4); text-align: center; }
    .dot { width: 14px; height: 14px; border-radius: 9999px; background: #16a34a; margin: 0 auto 16px; box-shadow: 0 0 22px #16a34aaa; }
    h1 { margin: 0 0 8px; font-size: 24px; font-weight: 800; letter-spacing: -0.02em; }
    p { margin: 0 0 6px; color: rgba(12,10,9,0.7); }
    .email { font-weight: 700; color: #0c0a09; }
    .row { display:flex; flex-direction:column; gap:10px; margin-top:22px; }
    a.btn { display:inline-flex; align-items:center; justify-content:center; gap:8px; border-radius:9999px; padding:13px 20px; font-weight:700; text-decoration:none; transition: transform .2s ease; }
    a.btn:hover { transform: translateY(-1px); }
    .primary { color:#fff; background:linear-gradient(135deg,#fbbf24,#fb923c 45%,#ea580c); box-shadow:0 12px 30px -10px rgba(234,88,12,0.6); }
    .ghost { color:#0c0a09; background:rgba(255,255,255,0.7); border:1px solid rgba(15,12,9,0.1); }
    small { display:block; margin-top:14px; color:rgba(12,10,9,0.5); font-size:12.5px; }
  </style></head><body><div class="card">
    <div class="dot"></div>
    <h1>You're signed in 🎉</h1>
    <p>Signed in as <span class="email">${email}</span></p>
    <p>Now continue on WhatsApp to start using Mnemo.</p>
    <div class="row">
      <a class="btn primary" href="${wa}">Continue on WhatsApp →</a>
      <a class="btn ghost" href="/dashboard">Open the dashboard</a>
    </div>
    <small>You can close this tab anytime.</small>
  </div></body></html>`;
  return new NextResponse(html, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
