import { NextRequest, NextResponse } from "next/server";
import {
  exchangeCodeForTokens,
  saveTokens,
  verifyState,
} from "@/lib/google";
import { sendWhatsApp } from "@/lib/twilio";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const err = req.nextUrl.searchParams.get("error");

  if (err) {
    return successPage(
      `Google sign-in was cancelled (${err}). You can try again anytime by sending "connect google" in WhatsApp.`,
      false,
    );
  }
  if (!code || !state) {
    return successPage("Missing required OAuth parameters.", false);
  }

  const phone = verifyState(state);
  if (!phone) {
    return successPage(
      "Invalid OAuth state. Please start the connection again from WhatsApp.",
      false,
    );
  }

  try {
    const tokens = await exchangeCodeForTokens(code);
    await saveTokens(phone, tokens);

    // Best-effort WhatsApp confirmation. Don't fail the page if it errors.
    try {
      await sendWhatsApp({
        to: phone,
        body: `google calendar connected${tokens.email ? ` (${tokens.email})` : ""}.\n\ntry: "meet with ashok tomorrow at 11am" and i'll auto-create the event + meet link.`,
      });
    } catch (twilioErr) {
      console.error("[auth/google/callback] twilio send failed", twilioErr);
    }

    return successPage(
      `Connected as ${tokens.email ?? "your Google account"}. You can close this tab and head back to WhatsApp.`,
      true,
    );
  } catch (e) {
    console.error("[auth/google/callback] error", e);
    return successPage(
      "Something went wrong while connecting your Google account. Please try again.",
      false,
    );
  }
}

function successPage(message: string, ok: boolean): NextResponse {
  const accent = ok ? "#16a34a" : "#dc2626";
  const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Mnemo · Google</title><style>
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
