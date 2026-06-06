import { LegalPage, LegalSection } from "@/components/landing/LegalPage";

export const metadata = {
  title: "About — Feru AI",
  description: "The story and mission behind Feru AI.",
};

export default function AboutPage() {
  return (
    <LegalPage title="About Feru AI">
      <p>
        Feru AI is a calm, intelligent memory layer for people who have better
        things to do than remember everything. It lives where you already are —
        WhatsApp, Telegram, and email — and quietly captures your reminders,
        ideas, and follow-ups, then surfaces them at exactly the right moment.
      </p>

      <LegalSection heading="Why we built it">
        <p>
          Modern life asks your brain to juggle a hundred small things at once.
          You were never designed to hold all of them. We built Feru AI to take
          that weight off your mind — so you can focus on the work and the people
          that matter, and trust that nothing important slips through.
        </p>
      </LegalSection>

      <LegalSection heading="What we believe">
        <p>
          Software should feel effortless. No new app to learn, no complicated
          dashboards — just talk to Feru like you would a friend, by text or
          voice, and it handles the rest. Calm, fast, and genuinely useful.
        </p>
      </LegalSection>

      <LegalSection heading="Get in touch">
        <p>
          Questions, feedback, or partnership ideas? Reach us anytime at{" "}
          <a className="text-flame-700 underline" href="mailto:hello@feru.ai">
            hello@feru.ai
          </a>{" "}
          or on{" "}
          <a
            className="text-flame-700 underline"
            href="https://www.instagram.com/feru.ai"
            target="_blank"
            rel="noopener noreferrer"
          >
            Instagram
          </a>
          .
        </p>
      </LegalSection>
    </LegalPage>
  );
}
