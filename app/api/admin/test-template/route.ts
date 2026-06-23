import { NextRequest, NextResponse } from "next/server";
import { sendCloudTemplate } from "@/lib/whatsapp-cloud";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/admin/test-template?key=<ADMIN_KEY>&to=<digits>[&task=...][&lang=...]
 * Sends the configured WHATSAPP_REMINDER_TEMPLATE to a number on demand, so you
 * can confirm the template works without waiting for the 24h window to lapse.
 */
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const key = sp.get("key");
  const allowed = [process.env.ADMIN_KEY, process.env.CRON_SECRET].filter(
    Boolean,
  );
  if (!key || !allowed.includes(key)) {
    return new NextResponse("Unauthorized. Append ?key=<your ADMIN_KEY>", {
      status: 401,
    });
  }

  const to = sp.get("to");
  if (!to) {
    return NextResponse.json(
      { error: "Add &to=<digits>, e.g. &to=919361092458" },
      { status: 400 },
    );
  }

  const template = process.env.WHATSAPP_REMINDER_TEMPLATE;
  if (!template) {
    return NextResponse.json(
      { error: "WHATSAPP_REMINDER_TEMPLATE is not set in the environment yet." },
      { status: 400 },
    );
  }

  const lang = sp.get("lang") || process.env.WHATSAPP_TEMPLATE_LANG || "en";
  const task = sp.get("task") || "drink water";

  const result = await sendCloudTemplate(to, template, lang, [task]);
  return NextResponse.json({
    sent: result.ok,
    template,
    lang,
    task,
    to,
    ...(result.ok
      ? {}
      : {
          metaError: result.error,
          hint: "Common causes: template not Approved yet, or WHATSAPP_TEMPLATE_LANG doesn't match the template's language exactly (e.g. 'en' vs 'en_US').",
        }),
  });
}
