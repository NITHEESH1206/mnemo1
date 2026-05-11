import type { Reminder } from "./store";

export function welcomeMessage(): string {
  return [
    "👋 Hi, I'm Mnemo — your AI memory layer.",
    "",
    "Talk to me naturally:",
    "• \"Remind me to call James tomorrow at 3pm\"",
    "• \"Standup prep every Friday at 9am\"",
    "• \"Pick up dry cleaning in 2 hours\"",
    "",
    "Type *list* to see your reminders, *cancel <number>* to remove one, or *help* anytime.",
  ].join("\n");
}

export function helpMessage(): string {
  return [
    "📒 How to talk to me:",
    "",
    "*Set a reminder*",
    "• Remind me to <task> at 3pm",
    "• Remind me to <task> tomorrow at 9am",
    "• Remind me to <task> in 30 minutes",
    "• <task> every day at 7am",
    "• <task> every Friday at 9am",
    "",
    "*Manage*",
    "• list — show your reminders",
    "• cancel <number> — cancel a specific one",
    "• help — show this message",
  ].join("\n");
}

export function confirmationMessage(r: Reminder): string {
  const repeat =
    r.recurrence !== "none"
      ? `\n🔁 Repeats ${r.recurrence}`
      : "";
  return `✅ Got it.\n\n📌 *${r.task}*\n⏰ ${formatHuman(r.fireAt)}${repeat}`;
}

export function reminderFireMessage(r: Reminder): string {
  const repeatNote =
    r.recurrence !== "none"
      ? `\n\n_(Repeats ${r.recurrence} — I'll ping you again next time.)_`
      : "";
  return `⏰ Reminder: *${r.task}*${repeatNote}`;
}

export function listMessage(reminders: Reminder[]): string {
  if (reminders.length === 0) {
    return "You don't have any pending reminders. Try: \"Remind me to call James tomorrow at 3pm\".";
  }
  const lines = reminders.slice(0, 15).map((r, i) => {
    const rec = r.recurrence !== "none" ? ` 🔁 ${r.recurrence}` : "";
    return `${i + 1}. *${r.task}* — ${formatHuman(r.fireAt)}${rec}`;
  });
  const more =
    reminders.length > 15 ? `\n\n…and ${reminders.length - 15} more.` : "";
  return `📋 Your reminders:\n\n${lines.join("\n")}${more}\n\n_Reply 'cancel <number>' to remove one._`;
}

export function cancelledMessage(r: Reminder): string {
  return `🗑️ Cancelled: *${r.task}*`;
}

export function notFoundMessage(): string {
  return "I couldn't find that reminder. Type *list* to see what's pending.";
}

function formatHuman(iso: string): string {
  const d = new Date(iso);
  const timeZone = process.env.TIMEZONE_NAME || "Asia/Kolkata";
  return d.toLocaleString("en-US", {
    timeZone,
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
