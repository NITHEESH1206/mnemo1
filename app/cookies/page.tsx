import { LegalPage, LegalSection } from "@/components/landing/LegalPage";

export const metadata = {
  title: "Cookie Policy — Feru AI",
  description: "How Feru AI uses cookies and similar technologies.",
};

export default function CookiesPage() {
  return (
    <LegalPage title="Cookie Policy" updated="June 2026">
      <p>
        This Cookie Policy explains how Feru AI uses cookies and similar
        technologies when you visit our website and use our service.
      </p>

      <LegalSection heading="What cookies are">
        <p>
          Cookies are small text files stored on your device. They help websites
          remember your preferences, keep you signed in, and understand how the
          site is used.
        </p>
      </LegalSection>

      <LegalSection heading="How we use them">
        <p>
          We use essential cookies to keep you signed in and to keep the service
          secure (for example, your session). We may also use a small amount of
          analytics to understand which features are useful so we can improve
          them. We don&apos;t use cookies to sell your data.
        </p>
      </LegalSection>

      <LegalSection heading="Managing cookies">
        <p>
          You can control or delete cookies through your browser settings.
          Blocking essential cookies may affect core features like signing in.
        </p>
      </LegalSection>

      <LegalSection heading="Contact">
        <p>
          Questions about cookies? Email{" "}
          <a className="text-flame-700 underline" href="mailto:contact@feruai.com">
            contact@feruai.com
          </a>
          .
        </p>
      </LegalSection>
    </LegalPage>
  );
}
