import { LegalPage, LegalSection } from "@/components/landing/LegalPage";

export const metadata = {
  title: "Privacy Policy — Feru AI",
  description: "How Feru AI collects, uses, and protects your data.",
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="June 2026">
      <p>
        This Privacy Policy explains how Feru AI (&quot;we&quot;, &quot;us&quot;)
        collects, uses, and protects your information when you use our service.
        By using Feru AI, you agree to the practices described here.
      </p>

      <LegalSection heading="Information we collect">
        <p>
          We collect the information you give us to provide the service: your
          name and contact details, the messages and reminders you send, the
          channels you connect (such as WhatsApp, Telegram, email, and
          calendars), and basic usage data that helps us keep the product
          reliable.
        </p>
      </LegalSection>

      <LegalSection heading="How we use it">
        <p>
          We use your information to create and deliver reminders, sync with the
          services you connect, improve the product, and provide support. We do
          not sell your personal data, and we do not use your private content to
          train third-party models.
        </p>
      </LegalSection>

      <LegalSection heading="Data storage & security">
        <p>
          Your data is encrypted in transit and stored with reputable
          infrastructure providers. We apply reasonable technical and
          organizational measures to protect it, and we retain it only for as
          long as needed to provide the service.
        </p>
      </LegalSection>

      <LegalSection heading="Third-party services">
        <p>
          Feru AI integrates with services you choose to connect (for example
          Google, Microsoft, Notion, Twilio, and payment providers). Your use of
          those services is also governed by their own privacy policies.
        </p>
      </LegalSection>

      <LegalSection heading="Your rights">
        <p>
          You can access, export, or delete your data at any time. To make a
          request, contact us at{" "}
          <a className="text-flame-700 underline" href="mailto:privacy@feru.ai">
            privacy@feru.ai
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection heading="Changes">
        <p>
          We may update this policy from time to time. Material changes will be
          reflected on this page with a new &quot;last updated&quot; date.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
