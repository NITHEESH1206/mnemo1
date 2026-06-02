/**
 * Outbound email via Resend.
 *
 * Required env:
 *   RESEND_API_KEY   (https://resend.com → API Keys)
 *   EMAIL_FROM       e.g. "Mnemo <mnemo@yourdomain.com>" (verified domain)
 */

export async function sendEmail(
  to: string,
  subject: string,
  text: string,
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) {
    throw new Error("Missing RESEND_API_KEY or EMAIL_FROM");
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to, subject, text }),
  });

  if (!res.ok) {
    console.error("[email] send failed", res.status, await res.text());
    throw new Error(`Resend send failed: ${res.status}`);
  }
}

/** Extract a bare email address from a "Name <a@b.com>" style string. */
export function extractEmail(raw: string): string | null {
  if (!raw) return null;
  const m = raw.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i);
  return m ? m[0].toLowerCase() : null;
}

/**
 * Reduce an email body to the actionable command: drop quoted replies and
 * signatures so "Remind me to call James at 3pm" survives intact.
 */
export function cleanEmailBody(text: string): string {
  if (!text) return "";
  const lines = text.replace(/\r/g, "").split("\n");
  const out: string[] = [];
  for (const line of lines) {
    if (/^\s*>/.test(line)) break; // quoted reply
    if (/^On .+ wrote:\s*$/i.test(line)) break; // reply header
    if (/^--\s*$/.test(line)) break; // signature delimiter
    out.push(line);
  }
  return out.join(" ").replace(/\s+/g, " ").trim();
}
