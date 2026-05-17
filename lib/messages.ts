import type { Reminder } from "./store";

export function welcomeMessage(): string {
  return [
    "alright, your brain just got an upgrade. i'm Mnemo.",
    "",
    "just tell me what to remember:",
    "• 'remind me to call james tomorrow at 3pm'",
    "• 'standup prep every friday at 9am'",
    "• 'pick up groceries in 2 hours'",
    "",
    "type *list* to see what's coming up, *cancel <number>* to drop one, or *help* anytime.",
  ].join("\n");
}

export function helpMessage(): string {
  return [
    "here's how we work together:",
    "",
    "*set a reminder*",
    "• remind me to <thing> at 3pm",
    "• remind me to <thing> tomorrow at 9am",
    "• remind me to <thing> in 30 minutes",
    "• <thing> every day at 7am",
    "• <thing> every friday at 9am",
    "",
    "*housekeeping*",
    "• list — see what's pending",
    "• cancel <number> — drop one",
    "• help — this menu",
  ].join("\n");
}

export function confirmationMessage(r: Reminder): string {
  const repeat =
    r.recurrence !== "none" ? ` · repeats ${r.recurrence}` : "";
  return [
    "consider it remembered.",
    "",
    `*${r.task}*`,
    `${formatHuman(r.fireAt)}${repeat}`,
    "",
    "you can forget now.",
  ].join("\n");
}

export function reminderFireMessage(r: Reminder): string {
  const repeatNote =
    r.recurrence !== "none"
      ? `\n_(repeats ${r.recurrence} — i'll be back next time.)_`
      : "";
  return `⏰ heads up — *${r.task}*${repeatNote}`;
}

export function listMessage(reminders: Reminder[]): string {
  if (reminders.length === 0) {
    return "your queue is empty. living dangerously, i see. try: 'remind me to call james tomorrow at 3pm'.";
  }
  const lines = reminders.slice(0, 15).map((r, i) => {
    const rec = r.recurrence !== "none" ? ` · repeats ${r.recurrence}` : "";
    return `${i + 1}. *${r.task}* — ${formatHuman(r.fireAt)}${rec}`;
  });
  const more =
    reminders.length > 15 ? `\n\n…and ${reminders.length - 15} more.` : "";
  return [
    "things future-you should not forget:",
    "",
    lines.join("\n") + more,
    "",
    "reply 'cancel <number>' to drop one.",
  ].join("\n");
}

export function cancelledMessage(r: Reminder): string {
  return `*${r.task}* — forgotten. you're welcome.`;
}

export function notFoundMessage(): string {
  return "can't find that one. type *list* to see what's actually pending.";
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
