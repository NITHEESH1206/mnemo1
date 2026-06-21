/**
 * Channel-agnostic message handler.
 *
 * Takes an inbound message (from any channel) and returns the reply text.
 * `from` is a channel-prefixed address:
 *   "whatsapp:+91..."  or  "telegram:12345"
 * so all per-user storage (reminders, contacts, plan, counts, calendar tokens)
 * is naturally scoped per user per channel.
 */

import { parseMessage } from "./llm-parser";
import {
  addContact,
  addToList,
  allListNames,
  cancelReminderForUser,
  clearList,
  completeReminder,
  consumeLinkToken,
  createReminder,
  findContact,
  getContacts,
  getCoupon,
  getLastFired,
  getList,
  getMonthlyCount,
  getPlan,
  getUserZone,
  incrMonthlyCount,
  isPaidPlan,
  listForUser,
  redeemCoupon,
  registerUser,
  removeContact,
  removeFromList,
  setLastFired,
  setPhoneForEmail,
  setPlan,
  setUserZone,
  snoozeReminder,
  updateReminder,
  FREE_MONTHLY_LIMIT,
} from "./store";
import { offsetForZone, resolveZone } from "./timezone";
import {
  badAddMessage,
  badLinkMessage,
  cancelledMessage,
  confirmationMessage,
  couponAlreadyMessage,
  couponAppliedMessage,
  couponExhaustedMessage,
  couponInvalidMessage,
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
  doneMessage,
  editUsageMessage,
  editedMessage,
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
  nothingToActMessage,
  snoozedMessage,
  welcomeMessage,
  timezoneSetMessage,
  timezoneCurrentMessage,
  timezoneBadMessage,
  listAddedMessage,
  listShowMessage,
  listRemovedMessage,
  listItemNotFoundMessage,
  listClearedMessage,
  listsOverviewMessage,
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

/** Parse a snooze duration like "30m", "2 hours", "1d", "tomorrow". */
function parseSnooze(text: string, now: Date = new Date()): Date {
  const t = text.trim().toLowerCase();
  const m = t.match(/(\d+)\s*(m|min|minute|h|hr|hour|d|day)/);
  if (m) {
    const n = parseInt(m[1], 10);
    const unit = m[2];
    if (unit.startsWith("m")) return new Date(now.getTime() + n * 60_000);
    if (unit.startsWith("h")) return new Date(now.getTime() + n * 3_600_000);
    if (unit.startsWith("d")) return new Date(now.getTime() + n * 86_400_000);
  }
  if (/\btomorrow\b/.test(t)) return new Date(now.getTime() + 86_400_000);
  // default: 10 minutes
  return new Date(now.getTime() + 10 * 60_000);
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

  // Track the user (for the digest) + resolve their timezone.
  await registerUser(from).catch(() => {});

  const zone = await getUserZone(from);
  const offsetMin = offsetForZone(zone) ?? 330;
  const nowLocal = () =>
    new Date().toLocaleTimeString("en-US", {
      timeZone: zone,
      hour: "numeric",
      minute: "2-digit",
    });

  // --- Quick commands -------------------------------------------------
  if (!body || /^(hi|hello|hey|start|menu)\b/.test(lower)) {
    return welcomeMessage();
  }

  // --- Timezone -------------------------------------------------------
  if (/^(timezone|tz)\b/.test(lower)) {
    const arg = body.replace(/^(timezone|tz)\s*/i, "").trim();
    if (!arg) return timezoneCurrentMessage(zone, nowLocal());
    const resolved = resolveZone(arg);
    if (!resolved) return timezoneBadMessage();
    await setUserZone(from, resolved);
    const t = new Date().toLocaleTimeString("en-US", {
      timeZone: resolved,
      hour: "numeric",
      minute: "2-digit",
    });
    return timezoneSetMessage(resolved, t);
  }

  // --- Lists ----------------------------------------------------------
  // "add milk to shopping list" / "add milk to my shopping list"
  const listAdd = body.match(
    /^add\s+(.+?)\s+to\s+(?:my\s+)?(.+?)\s+list\b/i,
  );
  if (listAdd) {
    const item = listAdd[1].trim();
    const name = listAdd[2].trim();
    await addToList(from, name, item);
    return listAddedMessage(item, name);
  }
  const listRemove = body.match(
    /^remove\s+(.+?)\s+from\s+(?:my\s+)?(.+?)\s+list\b/i,
  );
  if (listRemove) {
    const item = listRemove[1].trim();
    const name = listRemove[2].trim();
    const ok = await removeFromList(from, name, item);
    return ok
      ? listRemovedMessage(item, name)
      : listItemNotFoundMessage(item, name);
  }
  const listShow = body.match(
    /^(?:show|view)\s+(?:my\s+)?(.+?)\s+list\b/i,
  );
  if (listShow) {
    const name = listShow[1].trim();
    return listShowMessage(name, await getList(from, name));
  }
  const listClear = body.match(/^clear\s+(?:my\s+)?(.+?)\s+list\b/i);
  if (listClear) {
    const name = listClear[1].trim();
    await clearList(from, name);
    return listClearedMessage(name);
  }
  if (/^lists\b/.test(lower)) {
    return listsOverviewMessage(await allListNames(from));
  }
  if (/^help\b/.test(lower)) {
    return helpMessage();
  }
  if (/^(list|reminders|show)\b/.test(lower)) {
    return listMessage(await listForUser(from), zone);
  }
  const cancelMatch = lower.match(/^(?:cancel|delete|remove)\s+(\d+)\b/);
  if (cancelMatch) {
    const n = parseInt(cancelMatch[1], 10);
    const cancelled = await cancelReminderForUser(from, n);
    return cancelled ? cancelledMessage(cancelled) : notFoundMessage();
  }

  // --- Done -----------------------------------------------------------
  if (/^(done|complete|completed|finished)\b/.test(lower)) {
    const numMatch = lower.match(/\b(\d+)\b/);
    if (numMatch) {
      const pending = await listForUser(from);
      const target = pending[parseInt(numMatch[1], 10) - 1];
      if (!target) return notFoundMessage();
      const r = await completeReminder(target.id);
      return r ? doneMessage(r) : notFoundMessage();
    }
    const lastId = await getLastFired(from);
    if (!lastId) return nothingToActMessage();
    const r = await completeReminder(lastId);
    return r ? doneMessage(r) : nothingToActMessage();
  }

  // --- Snooze ---------------------------------------------------------
  if (/^snooze\b/.test(lower)) {
    const numMatch = lower.match(/^snooze\s+(\d+)\s+(.+)$/);
    let targetId: string | null = null;
    let durText: string;
    if (numMatch) {
      const pending = await listForUser(from);
      targetId = pending[parseInt(numMatch[1], 10) - 1]?.id ?? null;
      durText = numMatch[2];
    } else {
      targetId = await getLastFired(from);
      durText = body.replace(/^snooze\s*/i, "").trim();
    }
    if (!targetId) return nothingToActMessage();
    const when = parseSnooze(durText);
    const r = await snoozeReminder(targetId, when);
    if (r) await setLastFired(from, r.id);
    return r ? snoozedMessage(r, zone) : notFoundMessage();
  }

  // --- Edit -----------------------------------------------------------
  const editMatch = body.match(/^edit\s+(\d+)\s+(.+)$/i);
  if (/^edit\b/i.test(lower)) {
    if (!editMatch) return editUsageMessage();
    const pending = await listForUser(from);
    const target = pending[parseInt(editMatch[1], 10) - 1];
    if (!target) return notFoundMessage();
    const reparse = await parseMessage(editMatch[2], new Date(), offsetMin);
    if (!reparse.ok) return reparse.reason;
    const updated = await updateReminder(target.id, {
      task: reparse.reminder.task,
      fireAt: reparse.reminder.fireAt,
      recurrence: reparse.reminder.recurrence,
      weekday: reparse.reminder.weekday,
    });
    return updated ? editedMessage(updated, zone) : notFoundMessage();
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

  // --- Redeem a coupon (100% off) ------------------------------------
  const couponMatch = body.match(
    /^(?:redeem|coupon|code)\s+([a-z0-9]{3,24})\s*$/i,
  );
  const bareCode = /^[a-z0-9]{4,24}$/i.test(body) ? body.trim() : null;
  const tryCode = couponMatch ? couponMatch[1] : bareCode;
  if (tryCode) {
    const coupon = await getCoupon(tryCode);
    if (coupon) {
      const res = await redeemCoupon(tryCode, from);
      if (res.ok && res.plan) {
        await setPlan(from, res.plan);
        return couponAppliedMessage(res.plan);
      }
      if (res.reason === "already") return couponAlreadyMessage();
      if (res.reason === "exhausted") return couponExhaustedMessage();
    } else if (couponMatch) {
      return couponInvalidMessage();
    }
  }

  // --- Activate a paid plan -------------------------------------------
  const linkMatch = body.match(/^link\s+([a-z0-9]{6,12})\s*$/i);
  if (linkMatch) {
    const data = await consumeLinkToken(linkMatch[1]);
    if (!data) return badLinkMessage();
    await setPlan(from, data.plan, data.email);
    // Link email → this phone so the web dashboard can show their reminders.
    if (data.email) await setPhoneForEmail(data.email, from);
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
    const result = await notionSave(from, noteText, "Captured via Feru AI.");
    if (result.ok) return noteSavedMessage(noteText);
    if (result.reason === "not_connected") return notionNotConnectedMessage();
    if (result.reason === "no_target") return notionNoTargetMessage();
    return "couldn't save that to notion right now — try again in a moment.";
  }

  // --- Natural-language reminder / meeting ----------------------------
  const parsed = await parseMessage(body, new Date(), offsetMin);
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

  // Friend-to-friend (but NOT for meetings — those just create a calendar
  // event titled "Meet with <name>", no phone number needed).
  if (r.recipientName && !r.meeting) {
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
    return friendConfirmationMessage(friendReminder, r.recipientName, zone);
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
      return meetingNeedsConnectMessage(created, gLink, mLink, zone);
    }

    // Prefer Google when both are connected.
    if (googleTokens) {
      try {
        const auth = await authedClientFor(from);
        if (!auth) throw new Error("not_connected");
        const event = await createCalendarEvent(from, {
          summary,
          description: "Created from chat by Feru AI.",
          startISO: r.fireAt.toISOString(),
          durationMinutes: 60,
        });
        return meetingConfirmationMessage(
          created,
          event.meetLink,
          event.htmlLink,
          "google meet",
          zone,
        );
      } catch (calErr) {
        console.error("[handle] google calendar error", calErr);
        return (
          confirmationMessage(created, zone) +
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
        zone,
      );
    } catch (calErr) {
      console.error("[handle] outlook calendar error", calErr);
      return (
        confirmationMessage(created, zone) +
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
        `Reminder · ${new Date(created.fireAt).toISOString()} · via Feru AI`,
      );
    }
  } catch (e) {
    console.error("[handle] notion mirror failed", e);
  }

  // Normal reminder — confirmation + universal add-to-calendar link
  return (
    confirmationMessage(created, zone) +
    `\n\n🗓️ add to calendar: ${icsLink(baseUrl, created.task, new Date(created.fireAt))}`
  );
}
