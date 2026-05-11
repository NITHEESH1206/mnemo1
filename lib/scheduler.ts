import type { Reminder } from "./store";

/**
 * Given a fired reminder, returns the next occurrence based on its
 * recurrence — or `null` if it's a one-off.
 */
export function nextOccurrence(r: Reminder): Date | null {
  const d = new Date(r.fireAt);

  switch (r.recurrence) {
    case "daily":
      d.setDate(d.getDate() + 1);
      return d;
    case "weekly":
      d.setDate(d.getDate() + 7);
      return d;
    case "monthly":
      d.setMonth(d.getMonth() + 1);
      return d;
    case "none":
    default:
      return null;
  }
}
