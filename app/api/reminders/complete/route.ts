import { NextRequest, NextResponse } from "next/server";
import { readSession, SESSION_COOKIE_NAME } from "@/lib/google";
import {
  completeReminder,
  getPhoneForEmail,
  getReminderById,
} from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const session = readSession(req.cookies.get(SESSION_COOKIE_NAME)?.value);
  const phone = session?.email ? await getPhoneForEmail(session.email) : null;
  if (!phone) {
    return NextResponse.json({ error: "Not linked." }, { status: 403 });
  }

  const { id } = (await req.json()) as { id?: string };
  if (!id) return NextResponse.json({ error: "Missing id." }, { status: 400 });

  // Verify ownership before completing.
  const r = await getReminderById(id);
  if (!r || r.userPhone !== phone) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  await completeReminder(id);
  return NextResponse.json({ ok: true });
}
