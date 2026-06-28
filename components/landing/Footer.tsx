"use client";

import { Logo } from "@/components/ui/Logo";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { FOOTER_LINKS } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="relative border-t border-white/10 bg-[#0b0a12] pt-20 pb-10">
      <div className="container-x">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-5">
          <div className="col-span-2 md:col-span-1">
            <Logo dark />
            <p className="mt-4 max-w-xs text-[13.5px] leading-relaxed text-white/55">
              The calm AI memory layer that quietly keeps your life in motion.
            </p>
            <a
              href="mailto:contact@feruai.com"
              className="mt-4 inline-block text-[13.5px] font-semibold text-flame-400 hover:text-flame-300"
            >
              contact@feruai.com
            </a>
          </div>

          {Object.entries(FOOTER_LINKS).map(([group, links]) => (
            <div key={group}>
              <div className="text-[12px] font-extrabold uppercase tracking-[0.16em] text-white">
                {group}
              </div>
              <ul className="mt-4 space-y-2.5">
                {links.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      className="inline-flex items-center gap-2 text-[13.5px] font-medium text-white/55 transition-colors hover:text-white"
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

        <div className="mt-16 flex flex-col items-center justify-between gap-5 border-t border-white/10 pt-8 md:flex-row">
          <p className="text-[12.5px] text-white/50">
            © 2026 Feru AI. Built for humans who have better things to remember.
          </p>
          <div className="flex items-center gap-3">
            <a
              href="https://www.instagram.com/feru.ai?igsh=MTFsYjlodjNuZWw0OQ=="
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Feru AI on Instagram"
              className="grid h-10 w-10 place-items-center rounded-full border border-white/12 bg-white/[0.06] text-white/80 transition-colors hover:bg-white/[0.12] hover:text-white"
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
