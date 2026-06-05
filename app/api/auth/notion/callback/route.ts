import { NextRequest, NextResponse } from "next/server";
import {
  exchangeNotionCode,
  saveNotionToken,
  verifyNotionState,
} from "@/lib/notion";
import { sendMessage } from "@/lib/notify";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const err = req.nextUrl.searchParams.get("error");

  if (err) return resultPage(`Notion sign-in was cancelled (${err}).`, false);
  if (!code || !state) return resultPage("Missing OAuth parameters.", false);

  const phone = verifyNotionState(state);
  if (!phone) return resultPage("Invalid sign-in state. Please try again.", false);

  try {
    const token = await exchangeNotionCode(code);
    await saveNotionToken(phone, token);

    try {
      await sendMessage(
        phone,
        `notion connected${token.workspace_name ? ` (${token.workspace_name})` : ""}. 📒\n\ni'll save your reminders + notes there. try: *note buy oat milk* or just set a reminder.`,
      );
    } catch (sendErr) {
      console.error("[auth/notion/callback] notify failed", sendErr);
    }

    return resultPage(
      `Connected to ${token.workspace_name ?? "your Notion workspace"}. You can close this tab and head back to chat.`,
      true,
    );
  } catch (e) {
    console.error("[auth/notion/callback] error", e);
    return resultPage(
      "Something went wrong connecting Notion. Please try again.",
      false,
    );
  }
}

function resultPage(message: string, ok: boolean): NextResponse {
  const accent = ok ? "#16a34a" : "#dc2626";
  const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Feru AI</title><style>
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
