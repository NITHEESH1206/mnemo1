"use client";

import { useEffect, useState } from "react";
import { Bell, Search } from "lucide-react";
import { greetingForHour } from "@/lib/utils";

export function TopBar() {
  const [greeting, setGreeting] = useState("Good morning");

  useEffect(() => {
    setGreeting(greetingForHour(new Date().getHours()));
  }, []);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-ink/8 bg-white/70 px-5 backdrop-blur-xl md:px-8">
      <div>
        <h1 className="text-[18px] font-extrabold tracking-tight text-ink sm:text-[20px]">
          {greeting}, Alex 👋
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <label className="relative hidden md:block">
          <Search
            size={14}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink/45"
          />
          <input
            type="text"
            placeholder="Search reminders…"
            className="h-9 w-72 rounded-full border border-ink/8 bg-white pl-9 pr-16 text-[13.5px] text-ink placeholder:text-ink/40 focus:border-flame-400 focus:outline-none focus:ring-2 focus:ring-flame-300/60"
          />
          <kbd className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md border border-ink/10 bg-bg-tint px-1.5 py-0.5 text-[10.5px] font-bold text-ink/55">
            ⌘K
          </kbd>
        </label>

        <button
          aria-label="Notifications"
          className="btn-glass relative h-10 w-10 !p-0"
        >
          <Bell size={16} />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-flame-500 shadow-[0_0_10px_rgba(249,115,22,0.9)]" />
        </button>
      </div>
    </header>
  );
}
