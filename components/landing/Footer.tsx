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
            © 2026 Feru AI. Built for humans who have better things to remember.
          </p>
          <div className="flex items-center gap-3">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="btn-glass h-10 w-10 !p-0"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <rect
                  x="2.5"
                  y="2.5"
                  width="19"
                  height="19"
                  rx="5.5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
                <circle
                  cx="12"
                  cy="12"
                  r="4.2"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
                <circle cx="17.4" cy="6.6" r="1.2" fill="currentColor" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
