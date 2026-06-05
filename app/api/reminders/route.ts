import { NextRequest, NextResponse } from "next/server";
import { readSession, SESSION_COOKIE_NAME } from "@/lib/google";
import {
  createReminder,
  getMonthlyCount,
  getPhoneForEmail,
  getPlan,
  getUserZone,
  incrMonthlyCount,
  isPaidPlan,
  listForUser,
  FREE_MONTHLY_LIMIT,
} from "@/lib/store";
import { parseMessage } from "@/lib/llm-parser";
import { offsetForZone } from "@/lib/timezone";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function phoneFromRequest(req: NextRequest): Promise<string | null> {
  const session = readSession(req.cookies.get(SESSION_COOKIE_NAME)?.value);
  if (!session?.email) return null;
  return getPhoneForEmail(session.email);
}

function publicReminder(r: {
  id: string;
  task: string;
  fireAt: string;
  recurrence: string;
}) {
  return { id: r.id, task: r.task, fireAt: r.fireAt, recurrence: r.recurrence };
}

export async function GET(req: NextRequest) {
  const phone = await phoneFromRequest(req);
  if (!phone) {
    return NextResponse.json({ linked: false, reminders: [] });
  }
  const [reminders, plan, used] = await Promise.all([
    listForUser(phone),
    getPlan(phone),
    getMonthlyCount(phone),
  ]);
  return NextResponse.json({
    linked: true,
    plan,
    used,
    limit: isPaidPlan(plan) ? null : FREE_MONTHLY_LIMIT,
    reminders: reminders.map(publicReminder),
  });
}

export async function POST(req: NextRequest) {
  const phone = await phoneFromRequest(req);
  if (!phone) {
    return NextResponse.json(
      { error: "Connect your WhatsApp number first." },
      { status: 403 },
    );
  }

  const { text } = (await req.json()) as { text?: string };
  if (!text || !text.trim()) {
    return NextResponse.json({ error: "Empty reminder." }, { status: 400 });
  }

  const plan = await getPlan(phone);
  if (!isPaidPlan(plan)) {
    const used = await getMonthlyCount(phone);
    if (used >= FREE_MONTHLY_LIMIT) {
      return NextResponse.json(
        { error: "limit", message: "Free plan limit reached this month." },
        { status: 402 },
      );
    }
  }

  const zone = await getUserZone(phone);
  const offset = offsetForZone(zone) ?? 330;
  const parsed = await parseMessage(text, new Date(), offset);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.reason }, { status: 400 });
  }

  const created = await createReminder({
    userPhone: phone,
    task: parsed.reminder.task,
    fireAt: parsed.reminder.fireAt,
    recurrence: parsed.reminder.recurrence,
    weekday: parsed.reminder.weekday,
  });
  await incrMonthlyCount(phone);

  return NextResponse.json({ reminder: publicReminder(created) });
}
