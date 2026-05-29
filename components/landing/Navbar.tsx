"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { NAV_LINKS } from "@/lib/constants";
import { Logo } from "@/components/ui/Logo";
import { GradientButton } from "@/components/ui/GradientButton";
import { whatsappCTAUrl } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="fixed inset-x-0 top-4 z-50 px-4">
      <header
        className={cn(
          "mx-auto flex max-w-3xl items-center justify-between gap-3 rounded-full px-3 py-2 transition-all duration-300",
          "glass-strong",
          scrolled && "shadow-[0_24px_60px_-24px_rgba(20,60,110,0.4)]",
        )}
      >
        <Link
          href="/"
          aria-label="Mnemo home"
          className="shrink-0 pl-2.5 pr-1"
        >
          <Logo />
        </Link>

        <nav
          className="hidden items-center gap-1 md:flex"
          aria-label="Primary"
        >
          {NAV_LINKS.slice(0, 3).map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="relative inline-flex items-center rounded-full px-3.5 py-2 text-[14px] font-semibold text-ink/80 transition-colors hover:text-ink"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <a
            href="#signin"
            className="rounded-full px-3 py-2 text-[14px] font-semibold text-ink/80 hover:text-ink"
          >
            Log in
          </a>
          <GradientButton
            href={whatsappCTAUrl("Hi Mnemo! I want to start the free trial.")}
            target="_blank"
            variant="primary"
            size="sm"
            className="text-[13.5px]"
          >
            Try for Free
          </GradientButton>
        </div>

        <button
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
          className="md:hidden btn-glass h-10 w-10 !p-0"
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="md:hidden mx-auto mt-3 max-w-md glass-strong rounded-3xl p-4"
          >
            <div className="flex flex-col gap-1">
              {NAV_LINKS.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="rounded-2xl px-4 py-3 text-[15px] font-semibold text-ink/80 transition-colors hover:bg-white/60 hover:text-ink"
                >
                  {l.label}
                </a>
              ))}
              <div className="mt-3 flex flex-col gap-2 border-t border-ink/10 pt-3">
                <GradientButton
                  href="#signin"
                  variant="glass"
                  size="md"
                  className="w-full justify-center"
                >
                  Log in
                </GradientButton>
                <GradientButton
                  href={whatsappCTAUrl(
                    "Hi Mnemo! I want to start the free trial.",
                  )}
                  target="_blank"
                  variant="primary"
                  size="md"
                  className="w-full justify-center"
                >
                  Try for Free
                </GradientButton>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
