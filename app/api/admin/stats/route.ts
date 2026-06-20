import { NextRequest, NextResponse } from "next/server";
import {
  allUsers,
  countBotUsers,
  countWebUsers,
  countSubscriptions,
} from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/admin/stats?key=<CRON_SECRET>
 * A tiny private dashboard of how many people use Feru AI.
 */
export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key");
  const allowed = [process.env.ADMIN_KEY, process.env.CRON_SECRET].filter(
    Boolean,
  );
  if (!key || !allowed.includes(key)) {
    return new NextResponse(
      "Unauthorized. Append ?key=<your ADMIN_KEY> to the URL.",
      { status: 401 },
    );
  }

  const [bot, web, subs, users] = await Promise.all([
    countBotUsers(),
    countWebUsers(),
    countSubscriptions(),
    allUsers(),
  ]);

  const whatsapp = users.filter((u) => u.startsWith("whatsapp:")).length;
  const telegram = users.filter((u) => u.startsWith("telegram:")).length;
  const email = users.filter((u) => u.startsWith("email:")).length;

  if (req.nextUrl.searchParams.get("format") === "json") {
    return NextResponse.json({
      botUsers: bot,
      byChannel: { whatsapp, telegram, email },
      webSignIns: web,
      paidSubscriptions: subs,
      checkedAt: new Date().toISOString(),
    });
  }

  const card = (label: string, value: number, accent = "#ea580c") => `
    <div style="background:#fff;border:1px solid rgba(15,12,9,0.08);border-radius:22px;padding:26px 28px;box-shadow:0 18px 40px -26px rgba(120,53,15,0.25)">
      <div style="font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#a8a29e">${label}</div>
      <div style="margin-top:8px;font-size:52px;font-weight:800;color:${accent};line-height:1">${value.toLocaleString("en-IN")}</div>
    </div>`;

  const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Feru AI · Stats</title><style>
    body{margin:0;background:#fff8f0;color:#0c0a09;font:16px/1.5 system-ui,-apple-system,sans-serif;padding:40px 20px}
    .wrap{max-width:760px;margin:0 auto}
    h1{font-size:26px;font-weight:800;margin:0 0 4px}
    .sub{color:#78716c;margin:0 0 28px}
    .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px}
    .hint{margin-top:30px;color:#a8a29e;font-size:13px}
  </style></head><body><div class="wrap">
    <h1>Feru AI — who's using it</h1>
    <p class="sub">Live from your database · ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST</p>
    <div class="grid">
      ${card("Total bot users", bot)}
      ${card("Web sign-ins", web, "#0c4a6e")}
      ${card("Paid subscriptions", subs, "#16a34a")}
      ${card("WhatsApp", whatsapp)}
      ${card("Telegram", telegram, "#0284c7")}
      ${card("Email", email, "#7c2d12")}
    </div>
    <p class="hint">"Bot users" = everyone who has ever messaged Feru AI on any channel. Refresh to update. Add &format=json for raw data.</p>
  </div></body></html>`;

  return new NextResponse(html, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
