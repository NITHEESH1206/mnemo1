import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/telegram/setup   (auth: ?secret=<CRON_SECRET>)
 * Registers this deployment's /api/telegram/webhook with Telegram and sets
 * the secret token. Run once after deploying (or whenever the URL changes).
 */
export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("secret");
  const allowed = [process.env.ADMIN_KEY, process.env.CRON_SECRET].filter(
    Boolean,
  );
  if (allowed.length && !allowed.includes(key || "")) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    return NextResponse.json(
      { ok: false, error: "Missing TELEGRAM_BOT_TOKEN" },
      { status: 500 },
    );
  }

  const base =
    process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "") ||
    `${req.headers.get("x-forwarded-proto") || "https"}://${req.headers.get("host")}`;
  const webhookUrl = `${base}/api/telegram/webhook`;

  const res = await fetch(
    `https://api.telegram.org/bot${token}/setWebhook`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: webhookUrl,
        secret_token: process.env.TELEGRAM_WEBHOOK_SECRET || undefined,
        allowed_updates: ["message"],
      }),
    },
  );
  const data = await res.json();
  return NextResponse.json({ ok: res.ok, webhookUrl, telegram: data });
}
