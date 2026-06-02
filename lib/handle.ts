/**
 * Channel-agnostic message handler.
 *
 * Takes an inbound message (from any channel) and returns the reply text.
 * `from` is a channel-prefixed address:
 *   "whatsapp:+91..."  or  "telegram:12345"
 * so all per-user storage (reminders, contacts, plan, counts, calendar tokens)
 * is naturally scoped per user per channel.
 */

import { parseReminder } from "./parser";
import {
  addContact,
  cancelReminderForUser,
  consumeLinkToken,
  createReminder,
  findContact,
  getContacts,
  getMonthlyCount,
  getPlan,
  incrMonthlyCount,
  isPaidPlan,
  listForUser,
  removeContact,
  setPlan,
  FREE_MONTHLY_LIMIT,
} from "./store";
import {
  badAddMessage,
  badLinkMessage,
  cancelledMessage,
  confirmationMessage,
  connectGoogleMessage,
  connectNotionMessage,
  connectOutlookMessage,
  contactAddedMessage,
  contactForgottenMessage,
  contactNotFoundMessage,
  contactsListMessage,
  disconnectedGoogleMessage,
  disconnectedNotionMessage,
  disconnectedOutlookMessage,
  friendConfirmationMessage,
  helpMessage,
  limitReachedMessage,
  linkedPlanMessage,
  listMessage,
  meetingConfirmationMessage,
  meetingNeedsConnectMessage,
  needContactMessage,
  notFoundMessage,
  noteSavedMessage,
  noteUsageMessage,
  notionNoTargetMessage,
  notionNotConnectedMessage,
  welcomeMessage,
} from "./messages";
import {
  authedClientFor,
  clearTokens,
  createCalendarEvent,
  getTokens,
} from "./google";
import {
  clearMsTokens,
  createOutlookEvent,
  getMsTokens,
} from "./microsoft";
import { clearNotion, getNotionToken, notionSave } from "./notion";

function capitalize(s: string): string {
  if (!s) return s;
  return s[0].toUpperCase() + s.slice(1);
}

function icsLink(baseUrl: string, title: string, fireAt: Date): string {
  const q = new URLSearchParams({
    title,
    start: String(fireAt.getTime()),
    dur: "30",
  });
  return `${baseUrl}/api/ics?${q.toString()}`;
}

export async function handleIncomingMessage(params: {
  from: string;
  text: string;
  baseUrl: string;
}): Promise<string> {
  const { from, baseUrl } = params;
  const body = (params.text || "").trim();
  const lower = body.toLowerCase();

  // --- Quick commands -------------------------------------------------
  if (!body || /^(hi|hello|hey|start|menu)\b/.test(lower)) {
    return welcomeMessage();
  }
  if (/^help\b/.test(lower)) {
    return helpMessage();
  }
  if (/^(list|reminders|show)\b/.test(lower)) {
    return listMessage(await listForUser(from));
  }
  const cancelMatch = lower.match(/^(?:cancel|delete|remove)\s+(\d+)\b/);
  if (cancelMatch) {
    const n = parseInt(cancelMatch[1], 10);
    const cancelled = await cancelReminderForUser(from, n);
    return cancelled ? cancelledMessage(cancelled) : notFoundMessage();
  }

  // --- Contacts -------------------------------------------------------
  if (/^(contacts|people)\b/.test(lower)) {
    return contactsListMessage(await getContacts(from));
  }
  if (/^add\b/i.test(lower)) {
    const addMatch = body.match(
      /^add\s+([a-z][a-z'.\- ]*?)\s+(\+?\d[\d\s-]{6,})\s*$/i,
    );
    if (!addMatch) return badAddMessage();
    const name = addMatch[1].trim();
    const digits = addMatch[2].replace(/[^\d+]/g, "");
    const e164 = digits.startsWith("+") ? digits : `+${digits}`;
    await addContact(from, name, `whatsapp:${e164}`);
    return contactAddedMessage(name, e164);
  }
  const forgetMatch = body.match(/^forget\s+([a-z][a-z'.\- ]*?)\s*$/i);
  if (forgetMatch) {
    const name = forgetMatch[1].trim();
    const ok = await removeContact(from, name);
    return ok ? contactForgottenMessage(name) : contactNotFoundMessage(name);
  }

  // --- Activate a paid plan -------------------------------------------
  const linkMatch = body.match(/^link\s+([a-z0-9]{6,12})\s*$/i);
  if (linkMatch) {
    const data = await consumeLinkToken(linkMatch[1]);
    if (!data) return badLinkMessage();
    await setPlan(from, data.plan, data.email);
    return linkedPlanMessage(data.plan);
  }

  // --- Google Calendar ------------------------------------------------
  if (/^connect\s+google\b/.test(lower) || /^connect\s+gcal\b/.test(lower)) {
    const link = `${baseUrl}/api/auth/google?phone=${encodeURIComponent(from)}`;
    return connectGoogleMessage(link);
  }
  if (/^disconnect\s+google\b/.test(lower)) {
    await clearTokens(from);
    return disconnectedGoogleMessage();
  }

  // --- Outlook / Teams Calendar ---------------------------------------
  if (/^connect\s+(outlook|microsoft|teams)\b/.test(lower)) {
    const link = `${baseUrl}/api/auth/microsoft?phone=${encodeURIComponent(from)}`;
    return connectOutlookMessage(link);
  }
  if (/^disconnect\s+(outlook|microsoft|teams)\b/.test(lower)) {
    await clearMsTokens(from);
    return disconnectedOutlookMessage();
  }

  // --- Notion (memory trunk) ------------------------------------------
  if (/^connect\s+notion\b/.test(lower)) {
    const link = `${baseUrl}/api/auth/notion?phone=${encodeURIComponent(from)}`;
    return connectNotionMessage(link);
  }
  if (/^disconnect\s+notion\b/.test(lower)) {
    await clearNotion(from);
    return disconnectedNotionMessage();
  }
  if (/^note\b/i.test(lower)) {
    const noteText = body.replace(/^note\s*/i, "").trim();
    if (!noteText) return noteUsageMessage();
    const result = await notionSave(from, noteText, "Captured via Mnemo.");
    if (result.ok) return noteSavedMessage(noteText);
    if (result.reason === "not_connected") return notionNotConnectedMessage();
    if (result.reason === "no_target") return notionNoTargetMessage();
    return "couldn't save that to notion right now — try again in a moment.";
  }

  // --- Natural-language reminder / meeting ----------------------------
  const parsed = parseReminder(body);
  if (!parsed.ok) return parsed.reason;
  const r = parsed.reminder;

  // Free-tier gate
  const plan = await getPlan(from);
  if (!isPaidPlan(plan)) {
    const used = await getMonthlyCount(from);
    if (used >= FREE_MONTHLY_LIMIT) {
      return limitReachedMessage();
    }
  }

  // Friend-to-friend
  if (r.recipientName) {
    const contactPhone = await findContact(from, r.recipientName);
    if (!contactPhone) return needContactMessage(r.recipientName);
    const friendReminder = await createReminder({
      userPhone: from,
      task: r.task,
      fireAt: r.fireAt,
      recurrence: r.recurrence,
      weekday: r.weekday,
      recipientPhone: contactPhone,
      recipientName: r.recipientName,
    });
    await incrMonthlyCount(from);
    return friendConfirmationMessage(friendReminder, r.recipientName);
  }

  const created = await createReminder({
    userPhone: from,
    task: r.task,
    fireAt: r.fireAt,
    recurrence: r.recurrence,
    weekday: r.weekday,
  });
  await incrMonthlyCount(from);

  // Meeting → calendar event (Google Meet or Teams, whichever is connected)
  if (r.meeting) {
    const summary = capitalize(r.meeting.summary || r.task);
    const googleTokens = await getTokens(from);
    const msTokens = await getMsTokens(from);

    if (!googleTokens && !msTokens) {
      const gLink = `${baseUrl}/api/auth/google?phone=${encodeURIComponent(from)}`;
      const mLink = `${baseUrl}/api/auth/microsoft?phone=${encodeURIComponent(from)}`;
      return meetingNeedsConnectMessage(created, gLink, mLink);
    }

    // Prefer Google when both are connected.
    if (googleTokens) {
      try {
        const auth = await authedClientFor(from);
        if (!auth) throw new Error("not_connected");
        const event = await createCalendarEvent(from, {
          summary,
          description: "Created from chat by Mnemo.",
          startISO: r.fireAt.toISOString(),
          durationMinutes: 60,
        });
        return meetingConfirmationMessage(
          created,
          event.meetLink,
          event.htmlLink,
          "google meet",
        );
      } catch (calErr) {
        console.error("[handle] google calendar error", calErr);
        return (
          confirmationMessage(created) +
          "\n\n(couldn't reach google calendar this time — reminder is still set.)"
        );
      }
    }

    // Otherwise use Outlook / Teams.
    try {
      const event = await createOutlookEvent(from, {
        summary,
        startISO: r.fireAt.toISOString(),
        durationMinutes: 60,
      });
      return meetingConfirmationMessage(
        created,
        event.joinUrl,
        event.webLink,
        "teams meeting",
      );
    } catch (calErr) {
      console.error("[handle] outlook calendar error", calErr);
      return (
        confirmationMessage(created) +
        "\n\n(couldn't reach outlook this time — reminder is still set.)"
      );
    }
  }

  // Mirror into Notion if connected (best-effort, never blocks the reply).
  try {
    if (await getNotionToken(from)) {
      await notionSave(
        from,
        created.task,
        `Reminder · ${new Date(created.fireAt).toISOString()} · via Mnemo`,
      );
    }
  } catch (e) {
    console.error("[handle] notion mirror failed", e);
  }

  // Normal reminder — confirmation + universal add-to-calendar link
  return (
    confirmationMessage(created) +
    `\n\n🗓️ add to calendar: ${icsLink(baseUrl, created.task, new Date(created.fireAt))}`
  );
}
