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
    case "weekday": {
      // Advance one day at a time, skipping Saturday (6) and Sunday (0).
      do {
        d.setUTCDate(d.getUTCDate() + 1);
      } while (d.getUTCDay() === 0 || d.getUTCDay() === 6);
      return d;
    }
    case "weekly":
      d.setDate(d.getDate() + 7);
      return d;
    case "monthly":
      d.setMonth(d.getMonth() + 1);
      return d;
    case "interval": {
      const mins =
        r.intervalMinutes && r.intervalMinutes >= 15 ? r.intervalMinutes : 720;
      return new Date(d.getTime() + mins * 60_000);
    }
    case "none":
    default:
      return null;
  }
}
