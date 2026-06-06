import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated?: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="relative">
        <section className="section">
          <div className="mx-auto max-w-3xl px-6">
            <h1 className="text-[clamp(34px,5vw,52px)] font-extrabold tracking-tight text-ink">
              {title}
            </h1>
            {updated && (
              <p className="mt-3 text-[13.5px] text-ink/55">
                Last updated: {updated}
              </p>
            )}
            <div className="legal-prose mt-10 space-y-6 text-[16px] leading-relaxed text-ink/75">
              {children}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

export function LegalSection({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="mb-2 text-[20px] font-extrabold tracking-tight text-ink">
        {heading}
      </h2>
      <div className="space-y-3">{children}</div>
    </div>
  );
}
