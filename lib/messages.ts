import type { Reminder } from "./store";

export function welcomeMessage(): string {
  return [
    "alright, your brain just got an upgrade. i'm Feru AI.",
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
    "*nudge a friend*",
    "• add james +919876543210 — save a contact",
    "• remind james to call me at 6pm",
    "• contacts — see your people · forget <name>",
    "",
    "*lists*",
    "• add milk to shopping list",
    "• show shopping list · lists · clear shopping list",
    "",
    "*capture a note* (saved to Notion if connected)",
    "• note pick up the parcel tomorrow",
    "",
    "*housekeeping*",
    "• list — see what's pending",
    "• done — check off the last one (or *done 2*)",
    "• snooze 30m — push it back (or *snooze 2 1h*)",
    "• edit 2 call James at 5pm — change one",
    "• cancel <number> — drop one",
    "• timezone <city> — set your timezone",
    "• help — this menu",
  ].join("\n");
}

export function confirmationMessage(r: Reminder, tz?: string): string {
  const repeat =
    r.recurrence !== "none" ? ` · repeats ${r.recurrence}` : "";
  return [
    "consider it remembered.",
    "",
    `*${r.task}*`,
    `${formatHuman(r.fireAt, tz)}${repeat}`,
    "",
    "you can forget now.",
  ].join("\n");
}

export function reminderFireMessage(r: Reminder): string {
  const repeatNote =
    r.recurrence !== "none"
      ? `\n_(repeats ${r.recurrence} — i'll be back next time.)_`
      : "";
  return `⏰ heads up — *${r.task}*${repeatNote}\n\n_reply *done* or *snooze 30m*_`;
}

export function listMessage(reminders: Reminder[], tz?: string): string {
  if (reminders.length === 0) {
    return "your queue is empty. living dangerously, i see. try: 'remind me to call james tomorrow at 3pm'.";
  }
  const lines = reminders.slice(0, 15).map((r, i) => {
    const rec = r.recurrence !== "none" ? ` · repeats ${r.recurrence}` : "";
    return `${i + 1}. *${r.task}* — ${formatHuman(r.fireAt, tz)}${rec}`;
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

export function doneMessage(r: Reminder): string {
  return `✅ nice — *${r.task}* checked off.`;
}

export function snoozedMessage(r: Reminder, tz?: string): string {
  return `😴 snoozed *${r.task}* → ${formatHuman(r.fireAt, tz)}.`;
}

export function editedMessage(r: Reminder, tz?: string): string {
  const repeat = r.recurrence !== "none" ? ` · repeats ${r.recurrence}` : "";
  return `✏️ updated:\n\n*${r.task}*\n${formatHuman(r.fireAt, tz)}${repeat}`;
}

export function nothingToActMessage(): string {
  return "nothing recent to act on. reply *list* and use the number, e.g. *done 2*.";
}

export function editUsageMessage(): string {
  return "to edit: *edit <number> <new reminder>* — e.g. *edit 2 call James at 5pm*. type *list* for numbers.";
}

export function notFoundMessage(): string {
  return "can't find that one. type *list* to see what's actually pending.";
}

// ── Friend-to-friend + contacts ──────────────────────────────

export function friendConfirmationMessage(
  r: Reminder,
  recipientName: string,
  tz?: string,
): string {
  const repeat =
    r.recurrence !== "none" ? ` · repeats ${r.recurrence}` : "";
  const who = capitalize(recipientName);
  return [
    `done — i'll nudge *${who}* for you.`,
    "",
    `*${r.task}*`,
    `${formatHuman(r.fireAt, tz)}${repeat}`,
  ].join("\n");
}

export function friendReminderFireMessage(
  r: Reminder,
  recipientName?: string,
): string {
  const repeatNote =
    r.recurrence !== "none"
      ? `\n_(repeats ${r.recurrence})_`
      : "";
  return `⏰ a friendly nudge${recipientName ? `, ${capitalize(recipientName)}` : ""} — *${r.task}*\n\n_(set for you by a friend via Feru AI)_${repeatNote}\n\n_reply *done* or *snooze 30m*_`;
}

export function needContactMessage(name: string): string {
  const who = capitalize(name);
  return [
    `i don't have ${who}'s number yet.`,
    "",
    `add them first: *add ${name.toLowerCase()} +91XXXXXXXXXX*`,
    "then try your reminder again.",
  ].join("\n");
}

export function contactAddedMessage(name: string, phone: string): string {
  return `saved *${capitalize(name)}* (${phone}). now you can say "remind ${name.toLowerCase()} to call me at 6pm".`;
}

export function contactsListMessage(contacts: Record<string, string>): string {
  const entries = Object.entries(contacts);
  if (entries.length === 0) {
    return "no contacts yet. add one: *add james +91XXXXXXXXXX*";
  }
  const lines = entries.map(
    ([name, phone], i) => `${i + 1}. *${capitalize(name)}* — ${phone}`,
  );
  return ["your people:", "", lines.join("\n"), "", "remove one: *forget <name>*"].join(
    "\n",
  );
}

export function contactForgottenMessage(name: string): string {
  return `removed *${capitalize(name)}* from your contacts.`;
}

export function contactNotFoundMessage(name: string): string {
  return `i don't have anyone called *${capitalize(name)}*. type *contacts* to see who i know.`;
}

export function badAddMessage(): string {
  return [
    "to add a contact: *add <name> <phone>*",
    "example: *add james +919876543210*",
    "(include the country code with +)",
  ].join("\n");
}

// ── Plan linking + free-tier limit ───────────────────────────

export function linkedPlanMessage(plan: string): string {
  return [
    `🎉 your *${capitalize(plan)}* plan is now active on this number.`,
    "",
    "unlimited reminders unlocked. go wild.",
  ].join("\n");
}

export function badLinkMessage(): string {
  return "that activation code didn't work or has expired. grab a fresh one from the pricing page after subscribing.";
}

export function connectNotionMessage(link: string): string {
  return [
    "let's connect notion — your memory trunk. 📒",
    "",
    "tap this link, then pick a page or database to share with Feru AI:",
    link,
    "",
    "after that, your reminders + notes get saved there automatically.",
  ].join("\n");
}

export function disconnectedNotionMessage(): string {
  return "notion is unlinked. type *connect notion* anytime to hook it back up.";
}

export function noteSavedMessage(text: string): string {
  const short = text.length > 60 ? text.slice(0, 57) + "…" : text;
  return `📝 saved to notion: *${short}*`;
}

export function noteUsageMessage(): string {
  return "tell me what to note. try: *note pick up the parcel tomorrow*";
}

export function notionNotConnectedMessage(): string {
  return "connect notion first: type *connect notion*.";
}

export function notionNoTargetMessage(): string {
  return "i'm connected to notion but couldn't find a page to write to. open notion → share a page (or database) with the Feru AI integration, then try again.";
}

export function limitReachedMessage(): string {
  const base = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "") || "";
  const link = base ? `${base}/pricing` : "the pricing page";
  return [
    "you've used all *20* free reminders this month. 😅",
    "",
    `upgrade for unlimited reminders + every channel: ${link}`,
    "",
    "(your free reminders reset next month.)",
  ].join("\n");
}

export function trialOverMessage(pricingUrl: string): string {
  return [
    "your *7-day free trial* is over. ⏳",
    "",
    "i'd love to keep remembering things for you — subscribe to continue:",
    pricingUrl,
    "",
    "got a coupon? send *redeem <code>* to unlock it free.",
  ].join("\n");
}

export function couponAppliedMessage(plan: string): string {
  return [
    `🎉 coupon applied — you're on *${capitalize(plan)}*, 100% free.`,
    "",
    "unlimited reminders + every channel are all yours. enjoy! 🧡",
  ].join("\n");
}

export function couponInvalidMessage(): string {
  return "hmm, that coupon isn't valid. double-check it and try again — *redeem YOURCODE*";
}

export function couponExhaustedMessage(): string {
  return "ahh, that coupon's been fully claimed. 😅 keep an eye out for the next drop!";
}

export function couponAlreadyMessage(): string {
  return "you've already redeemed this one — you're all set. ✅";
}

function capitalize(s: string): string {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function connectGoogleMessage(link: string): string {
  return [
    "let's hook up your google calendar.",
    "",
    "tap this link, sign in with the gmail you want me to use, and i'll handle the rest:",
    link,
    "",
    "once connected, just say things like \"meet with ashok tomorrow at 11am\" and i'll auto-create the event + a google meet link.",
  ].join("\n");
}

export function disconnectedGoogleMessage(): string {
  return "google calendar is unlinked. type *connect google* anytime to hook it back up.";
}

export function connectOutlookMessage(link: string): string {
  return [
    "let's hook up your outlook calendar.",
    "",
    "tap this link and sign in with your microsoft account:",
    link,
    "",
    "once connected, say \"meet with ashok tomorrow at 11am\" and i'll create the event + a teams link.",
  ].join("\n");
}

export function disconnectedOutlookMessage(): string {
  return "outlook calendar is unlinked. type *connect outlook* anytime to hook it back up.";
}

export function meetingConfirmationMessage(
  r: Reminder,
  meetLink: string | undefined,
  eventLink: string | undefined,
  videoLabel = "video call",
  tz?: string,
): string {
  const repeat =
    r.recurrence !== "none" ? ` · repeats ${r.recurrence}` : "";
  const lines = [
    "calendar event created. 🗓️",
    "",
    `*${r.task}*`,
    `${formatHuman(r.fireAt, tz)}${repeat}`,
  ];
  if (meetLink) {
    lines.push("", `${videoLabel}: ${meetLink}`);
  }
  if (eventLink) {
    lines.push(`event: ${eventLink}`);
  }
  lines.push("", "i'll also ping you here a moment before.");
  return lines.join("\n");
}

export function meetingNeedsConnectMessage(
  r: Reminder,
  googleLink: string,
  outlookLink: string,
  tz?: string,
): string {
  return [
    "consider it remembered.",
    "",
    `*${r.task}*`,
    formatHuman(r.fireAt, tz),
    "",
    "want me to auto-create this on your calendar with a video link?",
    `• google: ${googleLink}`,
    `• outlook: ${outlookLink}`,
  ].join("\n");
}

// ── Timezone ─────────────────────────────────────────────────
export function timezoneSetMessage(zone: string, localTime: string): string {
  return `🌍 timezone set to *${zone}*. it's *${localTime}* for you now. reminders will use this from here on.`;
}
export function timezoneCurrentMessage(zone: string, localTime: string): string {
  return [
    `your timezone is *${zone}* (currently ${localTime}).`,
    "",
    "change it: *timezone Europe/London* (or a city, or IST/EST/PST).",
  ].join("\n");
}
export function timezoneBadMessage(): string {
  return "i didn't recognise that timezone. try a city like *timezone Asia/Kolkata*, or *timezone EST*.";
}

// ── Lists ────────────────────────────────────────────────────
export function listAddedMessage(item: string, name: string): string {
  return `🧺 added *${item}* to your *${name}* list.`;
}
export function listShowMessage(name: string, items: string[]): string {
  if (items.length === 0) {
    return `your *${name}* list is empty. add something: *add milk to ${name} list*.`;
  }
  const lines = items.map((it, i) => `${i + 1}. ${it}`);
  return [`📋 your *${name}* list:`, "", lines.join("\n")].join("\n");
}
export function listRemovedMessage(item: string, name: string): string {
  return `removed *${item}* from your *${name}* list.`;
}
export function listItemNotFoundMessage(item: string, name: string): string {
  return `couldn't find *${item}* in your *${name}* list.`;
}
export function listClearedMessage(name: string): string {
  return `cleared your *${name}* list.`;
}
export function listsOverviewMessage(names: string[]): string {
  if (names.length === 0) {
    return "no lists yet. try: *add milk to shopping list*.";
  }
  return [
    "your lists:",
    "",
    names.map((n) => `• ${n}`).join("\n"),
    "",
    "show one: *show shopping list*",
  ].join("\n");
}

// ── Daily digest ─────────────────────────────────────────────
export function digestMessage(
  reminders: Reminder[],
  tz?: string,
): string {
  if (reminders.length === 0) {
    return "☀️ good morning! nothing on the books today. enjoy the clear runway.";
  }
  const lines = reminders.map(
    (r) => `• ${formatTimeOnly(r.fireAt, tz)} — *${r.task}*`,
  );
  const count = reminders.length;
  return [
    `☀️ good morning! you've got *${count}* ${count === 1 ? "thing" : "things"} today:`,
    "",
    lines.join("\n"),
    "",
    "_reply *done* as you go, or *snooze* to push one._",
  ].join("\n");
}

function formatTimeOnly(iso: string, tz?: string): string {
  const d = new Date(iso);
  const timeZone = tz || process.env.TIMEZONE_NAME || "Asia/Kolkata";
  return d.toLocaleTimeString("en-US", {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatHuman(iso: string, tz?: string): string {
  const d = new Date(iso);
  const timeZone = tz || process.env.TIMEZONE_NAME || "Asia/Kolkata";
  return d.toLocaleString("en-US", {
    timeZone,
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
