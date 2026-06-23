/**
 * Timezone resolution. Stores an IANA zone name per user and computes the
 * current UTC offset (DST-aware) with Intl.
 */

const ALIASES: Record<string, string> = {
  ist: "Asia/Kolkata",
  india: "Asia/Kolkata",
  utc: "UTC",
  gmt: "UTC",
  est: "America/New_York",
  edt: "America/New_York",
  et: "America/New_York",
  cst: "America/Chicago",
  ct: "America/Chicago",
  mst: "America/Denver",
  pst: "America/Los_Angeles",
  pdt: "America/Los_Angeles",
  pt: "America/Los_Angeles",
  bst: "Europe/London",
  uk: "Europe/London",
  cet: "Europe/Paris",
  gst: "Asia/Dubai",
  dubai: "Asia/Dubai",
  sgt: "Asia/Singapore",
  aest: "Australia/Sydney",
  jst: "Asia/Tokyo",
};

// Common raw-offset inputs → a representative IANA zone.
const OFFSET_ZONES: Record<string, string> = {
  "+5:30": "Asia/Kolkata",
  "+5.5": "Asia/Kolkata",
  "+0": "UTC",
  "0": "UTC",
  "-5": "America/New_York",
  "-6": "America/Chicago",
  "-8": "America/Los_Angeles",
  "+1": "Europe/Paris",
  "+4": "Asia/Dubai",
  "+5": "Asia/Karachi",
  "+8": "Asia/Singapore",
  "+9": "Asia/Tokyo",
  "+10": "Australia/Sydney",
};

export const DEFAULT_TZ = "Asia/Kolkata";

/** Current offset (minutes east of UTC) for an IANA zone. */
export function offsetForZone(tz: string, at: Date = new Date()): number | null {
  try {
    const dtf = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    const parts = dtf.formatToParts(at);
    const m: Record<string, string> = {};
    for (const p of parts) m[p.type] = p.value;
    const asUTC = Date.UTC(
      +m.year,
      +m.month - 1,
      +m.day,
      +m.hour,
      +m.minute,
      +m.second,
    );
    return Math.round((asUTC - at.getTime()) / 60000);
  } catch {
    return null;
  }
}

/**
 * If `now` falls inside the quiet window for a zone, return the UTC Date when
 * quiet ends (so a reminder can be deferred to then). Otherwise null.
 * `start`/`end` are local hours 0-23; the window may wrap past midnight.
 */
export function quietResume(
  quiet: { start: number; end: number },
  zone: string,
  now: Date = new Date(),
): Date | null {
  const offset = offsetForZone(zone, now) ?? 330; // minutes east of UTC
  const localMs = now.getTime() + offset * 60000;
  const local = new Date(localMs);
  const hour = local.getUTCHours();
  const { start, end } = quiet;
  const inQuiet =
    start <= end ? hour >= start && hour < end : hour >= start || hour < end;
  if (!inQuiet) return null;
  const resumeLocal = new Date(localMs);
  resumeLocal.setUTCHours(end, 0, 0, 0);
  if (resumeLocal.getTime() <= localMs) {
    resumeLocal.setUTCDate(resumeLocal.getUTCDate() + 1);
  }
  return new Date(resumeLocal.getTime() - offset * 60000);
}

/** Resolve a user's free-text timezone input to an IANA zone name, or null. */
export function resolveZone(input: string): string | null {
  const raw = input.trim();
  if (!raw) return null;
  const lower = raw.toLowerCase().replace(/\s+/g, "");

  if (ALIASES[lower]) return ALIASES[lower];

  const offsetKey = lower.replace(/^utc|^gmt/, "").replace(":00", "");
  if (OFFSET_ZONES[offsetKey]) return OFFSET_ZONES[offsetKey];

  // Try as a real IANA zone (case-insensitive on the region part is tricky;
  // accept the user's exact casing first).
  if (offsetForZone(raw) !== null) return raw;

  // Title-case "asia/kolkata" → "Asia/Kolkata"
  const titled = raw
    .split("/")
    .map((seg) =>
      seg
        .split(/([_-])/)
        .map((w) => (w.length > 1 ? w[0].toUpperCase() + w.slice(1).toLowerCase() : w))
        .join(""),
    )
    .join("/");
  if (offsetForZone(titled) !== null) return titled;

  return null;
}
