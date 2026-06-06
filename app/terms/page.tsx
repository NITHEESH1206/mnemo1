import { LegalPage, LegalSection } from "@/components/landing/LegalPage";

export const metadata = {
  title: "Terms of Service — Feru AI",
  description: "The terms that govern your use of Feru AI.",
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated="June 2026">
      <p>
        These Terms of Service (&quot;Terms&quot;) govern your access to and use
        of Feru AI. By using the service, you agree to these Terms.
      </p>

      <LegalSection heading="Using Feru AI">
        <p>
          You must be at least 13 years old (or the age of digital consent in
          your country) to use Feru AI. You are responsible for the activity on
          your account and for keeping your access secure.
        </p>
      </LegalSection>

      <LegalSection heading="Acceptable use">
        <p>
          Don&apos;t use Feru AI to break the law, send spam, harass others, or
          disrupt the service. We may suspend accounts that abuse the platform or
          put other users at risk.
        </p>
      </LegalSection>

      <LegalSection heading="Plans & payments">
        <p>
          Paid plans are billed in advance through our payment provider. You can
          upgrade, downgrade, or cancel at any time, and a 14-day money-back
          guarantee applies to new paid subscriptions. Taxes may apply depending
          on your location.
        </p>
      </LegalSection>

      <LegalSection heading="Service availability">
        <p>
          We work hard to keep Feru AI reliable, but the service is provided
          &quot;as is&quot; without warranties of any kind. We are not liable for
          missed reminders caused by third-party outages (such as messaging or
          calendar providers) or events outside our reasonable control.
        </p>
      </LegalSection>

      <LegalSection heading="Changes & termination">
        <p>
          We may update these Terms or the service over time. You may stop using
          Feru AI at any time, and we may suspend or end access where necessary
          to protect the service or comply with the law.
        </p>
      </LegalSection>

      <LegalSection heading="Contact">
        <p>
          Questions about these Terms? Email{" "}
          <a className="text-flame-700 underline" href="mailto:hello@feru.ai">
            hello@feru.ai
          </a>
          .
        </p>
      </LegalSection>
    </LegalPage>
  );
}
