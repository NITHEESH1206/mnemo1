/**
 * Build an iCalendar (.ics) document — universally importable into Apple
 * Calendar, Google Calendar, Outlook, etc. No OAuth, no API.
 */

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/** Format a Date as a UTC iCal timestamp: 20260115T103000Z */
function toICalUTC(d: Date): string {
  return (
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}` +
    `T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`
  );
}

function escapeText(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

export function buildICS(opts: {
  title: string;
  startISO: string;
  durationMinutes?: number;
  description?: string;
  location?: string;
}): string {
  const start = new Date(opts.startISO);
  const end = new Date(
    start.getTime() + (opts.durationMinutes ?? 30) * 60_000,
  );
  const uid = `${start.getTime()}-${Math.random()
    .toString(36)
    .slice(2)}@mnemo`;

  // CRLF line endings are required by the spec.
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Feru AI//Reminder//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${toICalUTC(new Date())}`,
    `DTSTART:${toICalUTC(start)}`,
    `DTEND:${toICalUTC(end)}`,
    `SUMMARY:${escapeText(opts.title)}`,
    opts.description ? `DESCRIPTION:${escapeText(opts.description)}` : "",
    opts.location ? `LOCATION:${escapeText(opts.location)}` : "",
    "BEGIN:VALARM",
    "TRIGGER:-PT10M",
    "ACTION:DISPLAY",
    "DESCRIPTION:Reminder",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");
}
