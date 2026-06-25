"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { NAV_LINKS } from "@/lib/constants";
import { Logo } from "@/components/ui/Logo";
import { GradientButton } from "@/components/ui/GradientButton";
import { cn } from "@/lib/utils";

type User = { name: string; email: string };

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 16);
      // Hide when scrolling down (past the hero), reveal when scrolling up.
      if (y > lastY && y > 120) setHidden(true);
      else if (y < lastY) setHidden(false);
      lastY = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    let active = true;
    fetch("/api/me")
      .then((r) => r.json())
      .then((d) => {
        if (active && d.loggedIn) setUser({ name: d.name, email: d.email });
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const initial = user?.name?.charAt(0).toUpperCase() || "U";

  return (
    <div
      className={cn(
        "fixed inset-x-0 top-4 z-50 px-4 transition-transform duration-300 ease-out",
        hidden && !open && "-translate-y-[160%]",
      )}
    >
      <header
        className={cn(
          "mx-auto flex max-w-3xl items-center justify-between gap-3 rounded-full px-3 py-2 transition-all duration-300",
          "glass-strong",
          scrolled && "shadow-[0_24px_60px_-24px_rgba(20,60,110,0.4)]",
        )}
      >
        <Link
          href="/"
          aria-label="Feru AI home"
          className="shrink-0 pl-2.5 pr-1"
          onClick={(e) => {
            if (window.location.pathname === "/") {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
          }}
        >
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="relative inline-flex items-center rounded-full px-3.5 py-2 text-[14px] font-semibold text-ink/80 transition-colors hover:text-ink"
            >
              {l.label}
            </a>
          ))}
        </nav>

        {/* Right side — auth aware */}
        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <>
              <a
                href="/api/auth/logout"
                className="rounded-full px-3 py-2 text-[13.5px] font-semibold text-ink/55 transition-colors hover:text-ink"
              >
                Log out
              </a>
              <Link
                href="/dashboard"
                className="flex items-center gap-2 rounded-full bg-white/70 py-1 pl-1 pr-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_4px_14px_-6px_rgba(20,60,110,0.3)] ring-1 ring-white/70 transition-transform hover:-translate-y-[1px]"
              >
                <span className="grid h-7 w-7 place-items-center rounded-full bg-gradient-primary text-[12px] font-extrabold text-white">
                  {initial}
                </span>
                <span className="max-w-[120px] truncate text-[13.5px] font-bold text-ink">
                  {user.name}
                </span>
              </Link>
            </>
          ) : (
            <>
              <a
                href="/api/auth/google/login"
                className="rounded-full px-3 py-2 text-[14px] font-semibold text-ink/80 hover:text-ink"
              >
                Log in
              </a>
              <GradientButton
                href="/api/auth/google/login?next=wa"
                variant="primary"
                size="sm"
                className="text-[13.5px]"
              >
                Try for Free
              </GradientButton>
            </>
          )}
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
                {user ? (
                  <>
                    <div className="flex items-center gap-2.5 px-2 py-1">
                      <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-primary text-[13px] font-extrabold text-white">
                        {initial}
                      </span>
                      <div className="min-w-0">
                        <div className="truncate text-[14px] font-bold text-ink">
                          {user.name}
                        </div>
                        <div className="truncate text-[12px] text-ink/55">
                          {user.email}
                        </div>
                      </div>
                    </div>
                    <GradientButton
                      href="/dashboard"
                      variant="primary"
                      size="md"
                      className="w-full justify-center"
                    >
                      Open dashboard
                    </GradientButton>
                    <a
                      href="/api/auth/logout"
                      className="rounded-full px-4 py-2.5 text-center text-[14px] font-semibold text-ink/60 hover:text-ink"
                    >
                      Log out
                    </a>
                  </>
                ) : (
                  <>
                    <GradientButton
                      href="/api/auth/google/login"
                      variant="glass"
                      size="md"
                      className="w-full justify-center"
                    >
                      Log in
                    </GradientButton>
                    <GradientButton
                      href="/api/auth/google/login?next=wa"
                      variant="primary"
                      size="md"
                      className="w-full justify-center"
                    >
                      Try for Free
                    </GradientButton>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
