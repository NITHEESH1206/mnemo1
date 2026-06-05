import { NextRequest, NextResponse } from "next/server";
import { handleIncomingMessage } from "@/lib/handle";
import { cleanEmailBody, extractEmail, sendEmail } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/email/inbound
 *
 * Inbound-email webhook. Works with providers that POST either:
 *   - multipart/form-data (e.g. SendGrid Inbound Parse: from, subject, text)
 *   - application/json    ({ from, subject, text })
 *
 * Optional shared secret: ?secret=<INBOUND_EMAIL_TOKEN>.
 * Replies to the sender via Resend with Feru AI's answer.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.INBOUND_EMAIL_TOKEN;
  if (secret && req.nextUrl.searchParams.get("secret") !== secret) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  let fromRaw = "";
  let subject = "";
  let text = "";

  const ctype = req.headers.get("content-type") || "";
  try {
    if (ctype.includes("application/json")) {
      const body = (await req.json()) as Record<string, string>;
      fromRaw = body.from || body.sender || "";
      subject = body.subject || "";
      text = body.text || body.plain || body.body || "";
    } else {
      const form = await req.formData();
      fromRaw = String(form.get("from") || form.get("sender") || "");
      subject = String(form.get("subject") || "");
      text = String(form.get("text") || form.get("plain") || "");
    }
  } catch {
    return NextResponse.json({ ok: true }); // ignore malformed
  }

  const addr = extractEmail(fromRaw);
  if (!addr) return NextResponse.json({ ok: true });

  const command = cleanEmailBody(text) || subject.trim();
  const from = `email:${addr}`;
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "") ||
    `${req.headers.get("x-forwarded-proto") || "https"}://${req.headers.get("host")}`;

  try {
    const reply = await handleIncomingMessage({ from, text: command, baseUrl });
    await sendEmail(addr, "Re: Feru AI", reply);
  } catch (err) {
    console.error("[email/inbound] error", err);
    try {
      await sendEmail(
        addr,
        "Re: Feru AI",
        "my brain glitched for a sec. try that again, or reply 'help'.",
      );
    } catch {
      /* swallow */
    }
  }

  return NextResponse.json({ ok: true });
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    endpoint: "/api/email/inbound",
    method: "POST (inbound email)",
  });
}
