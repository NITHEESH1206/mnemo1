import type { Reminder } from "./store";

export function welcomeMessage(): string {
  return [
    "hey, i'm Feru AI — your second brain on WhatsApp. 🧠",
    "",
    "i remember things so you don't have to. just talk to me naturally:",
    "",
    "⏰ *remind me* to drink water at 2pm",
    "🔁 *standup prep* every weekday at 9am",
    "🛒 *add* milk to my grocery list",
    "🎙️ send a *voice note* — i'll catch it",
    "📸 send a *screenshot* — i'll pull out the details",
    "🏠 remind me to water the plants *when i get home*",
    '❓ ask me *"what\'s on for today?"* anytime',
    "",
    "type *help* to see everything — or just tell me what to remember. let's go 🚀",
  ].join("\n");
}

export function feedbackThanksMessage(): string {
  return "🙏 thank you — your note just reached the team. we read every single one.";
}

function hourLabel(n: number): string {
  const am = n < 12 ? "am" : "pm";
  const hr = n % 12 === 0 ? 12 : n % 12;
  return `${hr}${am}`;
}
export function quietHoursSetMessage(start: number, end: number): string {
  return [
    `🤫 quiet hours on — i won't ping you between ${hourLabel(start)} and ${hourLabel(end)}.`,
    `anything due in that window waits until ${hourLabel(end)}.`,
    "",
    "_type *quiet off* to turn this off._",
  ].join("\n");
}
export function quietHoursOffMessage(): string {
  return "🔔 quiet hours off — i'll remind you any time again.";
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
    "• <thing> every weekday at 9am",
    "• <thing> twice a day  ·  every 3 hours",
    "• <thing> first of every month",
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
    "• quiet hours 10pm to 7am — pause pings at night (*quiet off* to undo)",
    "• feedback <your thoughts> — tell us anything",
    "• help — this menu",
  ].join("\n");
}

function whenPhrase(iso: string, tz?: string): string {
  const timeZone = tz || process.env.TIMEZONE_NAME || "Asia/Kolkata";
  const d = new Date(iso);
  const now = new Date();
  const dayOf = (x: Date) => x.toLocaleDateString("en-US", { timeZone });
  const time = d.toLocaleTimeString("en-US", {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
  });
  if (dayOf(d) === dayOf(now)) return `at ${time}`;
  const tmr = new Date(now.getTime() + 86_400_000);
  if (dayOf(d) === dayOf(tmr)) return `tomorrow at ${time}`;
  const date = d.toLocaleDateString("en-US", {
    timeZone,
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  return `on ${date} at ${time}`;
}

const WEEKDAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

/** Human phrase for a reminder's recurrence, e.g. "twice a day". */
export function recurrenceLabel(r: Reminder): string {
  switch (r.recurrence) {
    case "daily":
      return "every day";
    case "weekday":
      return "every weekday (Mon–Fri)";
    case "weekly":
      return typeof r.weekday === "number"
        ? `every ${WEEKDAY_NAMES[r.weekday]}`
        : "every week";
    case "monthly":
      return "every month";
    case "interval": {
      const m = r.intervalMinutes || 720;
      if (m % 1440 === 0)
        return m === 1440 ? "every day" : `every ${m / 1440} days`;
      if (m % 60 === 0) {
        const h = m / 60;
        if (h === 12) return "twice a day";
        if (h === 8) return "3 times a day";
        if (h === 6) return "4 times a day";
        return `every ${h} hours`;
      }
      return `every ${m} minutes`;
    }
    default:
      return "";
  }
}

export function confirmationMessage(r: Reminder, tz?: string): string {
  const when = whenPhrase(r.fireAt, tz);
  if (r.recurrence !== "none") {
    return `Great — I'll remind you to *${r.task}* ${recurrenceLabel(r)} (next ${when}). 🔁`;
  }
  return `Great — I'll remind you ${when} to *${r.task}*. ✅`;
}

export function reminderFireMessage(r: Reminder): string {
  // Task is the headline; a tiny encouragement tag is optional.
  const tag = r.fireText ? ` — ${r.fireText}` : "";
  const repeatNote =
    r.recurrence !== "none" ? `\n\n_(repeats ${recurrenceLabel(r)})_` : "";
  return `⏰ Time to *${r.task}*${tag}${repeatNote}`;
}

export function listMessage(reminders: Reminder[], tz?: string): string {
  if (reminders.length === 0) {
    return "your queue is empty. living dangerously, i see. try: 'remind me to call james tomorrow at 3pm'.";
  }
  const lines = reminders.slice(0, 15).map((r, i) => {
    const rec = r.recurrence !== "none" ? ` · repeats ${recurrenceLabel(r)}` : "";
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
  const repeat = r.recurrence !== "none" ? ` · repeats ${recurrenceLabel(r)}` : "";
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
    r.recurrence !== "none" ? ` · repeats ${recurrenceLabel(r)}` : "";
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
      ? `\n_(repeats ${recurrenceLabel(r)})_`
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

export function referMessage(code: string, link: string, count: number): string {
  return [
    "share Feru AI with a friend 🧡",
    "",
    `your code: *${code}*`,
    `invite link: ${link}`,
    "",
    count > 0
      ? `you've referred *${count}* ${count === 1 ? "friend" : "friends"} so far.`
      : "refer 3 friends and i'll unlock *Pro* for you, free.",
  ].join("\n");
}

export function referralThanksMessage(): string {
  return 'welcome to Feru AI! 🎉 your friend just got referral credit. try "remind me to…" to start.';
}

export function savedToReadingMessage(url: string): string {
  return `saved to your reading list 📚\n\nsay *summarize ${url}* and i'll give you the gist.`;
}

export function capturedToInboxMessage(text: string): string {
  const snippet = text.length > 80 ? text.slice(0, 80) + "…" : text;
  return `not sure when you meant 🤔 — i tucked “${snippet}” into your *inbox* so it's not lost.\n\nadd a time like "remind me … at 6pm" to schedule it.`;
}

export function contextReminderSetMessage(task: string, place: string): string {
  return [
    `got it 📍 — i'll remind you to *${task}* when you're at *${place}*.`,
    "",
    `just message me "i'm at ${place}"${place === "home" ? ' (or "home")' : ""} when you arrive.`,
  ].join("\n");
}

export function contextRemindersDeliverMessage(
  place: string,
  tasks: string[],
): string {
  const lines = tasks.map((t) => `• ${t}`).join("\n");
  const head = place === "home" ? "🏠 welcome home!" : `📍 you're at *${place}*!`;
  return `${head} you wanted to:\n\n${lines}`;
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
    r.recurrence !== "none" ? ` · repeats ${recurrenceLabel(r)}` : "";
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
