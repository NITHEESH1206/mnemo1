"use client";

import { Logo } from "@/components/ui/Logo";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { FOOTER_LINKS } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="relative border-t border-ink/8 bg-white/60 backdrop-blur-xl pt-20 pb-10">
      <div className="container-x">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-5">
          <div className="col-span-2 md:col-span-1">
            <Logo />
            <p className="mt-4 max-w-xs text-[13.5px] leading-relaxed text-ink/65">
              The calm AI memory layer that quietly keeps your life in motion.
            </p>
          </div>

          {Object.entries(FOOTER_LINKS).map(([group, links]) => (
            <div key={group}>
              <div className="text-[12px] font-extrabold uppercase tracking-[0.16em] text-ink">
                {group}
              </div>
              <ul className="mt-4 space-y-2.5">
                {links.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      className="inline-flex items-center gap-2 text-[13.5px] font-medium text-ink/65 transition-colors hover:text-flame-700"
                    >
                      {group === "Integrations" && (
                        <BrandLogo name={l.label} size={18} />
                      )}
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-5 border-t border-ink/8 pt-8 md:flex-row">
          <p className="text-[12.5px] text-ink/60">
            © 2025 Mnemo. Built for humans who have better things to remember.
          </p>
          <div className="flex items-center gap-3">
            {[
              {
                label: "Twitter",
                path: (
                  <path d="M18 4l-6 8 6 8h-2.5L11 14.5 6.5 20H4l6.5-8L4 4h2.5L11 9.5 15.5 4H18z" />
                ),
              },
              {
                label: "LinkedIn",
                path: (
                  <>
                    <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5z" />
                    <path d="M3 9.5h4V20H3zM10 9.5h3.7v1.6h.06c.51-.94 1.76-1.93 3.62-1.93 3.87 0 4.58 2.46 4.58 5.66V20H18v-4.85c0-1.16-.02-2.65-1.66-2.65-1.66 0-1.92 1.25-1.92 2.55V20H10z" />
                  </>
                ),
              },
              {
                label: "GitHub",
                path: (
                  <path d="M12 2C6.5 2 2 6.6 2 12.2c0 4.5 2.86 8.3 6.84 9.65.5.1.68-.22.68-.49l-.01-1.7c-2.78.61-3.37-1.36-3.37-1.36-.46-1.18-1.12-1.5-1.12-1.5-.91-.63.07-.62.07-.62 1.01.07 1.55 1.05 1.55 1.05.9 1.57 2.37 1.12 2.95.86.09-.66.36-1.12.65-1.38-2.22-.26-4.55-1.13-4.55-5.01 0-1.11.39-2.02 1.04-2.73-.1-.26-.45-1.3.1-2.7 0 0 .84-.27 2.75 1.04A9.45 9.45 0 0 1 12 6.85c.85 0 1.71.12 2.51.34 1.91-1.31 2.75-1.04 2.75-1.04.55 1.4.2 2.44.1 2.7.65.71 1.04 1.62 1.04 2.73 0 3.89-2.34 4.75-4.57 5 .37.32.69.94.69 1.89l-.01 2.8c0 .27.18.59.69.49A10.1 10.1 0 0 0 22 12.2C22 6.6 17.52 2 12 2z" />
                ),
              },
            ].map((s) => (
              <a
                key={s.label}
                href="#"
                aria-label={s.label}
                className="btn-glass h-10 w-10 !p-0"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  {s.path}
                </svg>
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
