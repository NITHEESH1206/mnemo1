"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  Bell,
  Calendar,
  MessageSquare,
  Users,
  Settings,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Reminders", icon: Bell },
  { label: "Calendar", icon: Calendar },
  { label: "Channels", icon: MessageSquare },
  { label: "Team", icon: Users },
  { label: "Settings", icon: Settings },
];

export function Sidebar() {
  const [active, setActive] = useState("Dashboard");

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[240px] flex-col border-r border-ink/8 bg-white/70 backdrop-blur-xl lg:flex">
      <div className="flex h-16 items-center px-5 border-b border-ink/8">
        <Logo />
      </div>

      <nav
        className="flex-1 px-3 py-5 space-y-0.5"
        aria-label="Dashboard navigation"
      >
        {NAV.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.label;
          return (
            <button
              key={item.label}
              onClick={() => setActive(item.label)}
              className={cn(
                "group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-semibold transition-all",
                isActive
                  ? "bg-flame-50 text-flame-700"
                  : "text-ink/60 hover:bg-bg-tint hover:text-ink",
              )}
            >
              {isActive && (
                <span
                  aria-hidden
                  className="absolute left-0 top-1/2 h-6 -translate-y-1/2 rounded-r-full w-[3px] bg-gradient-primary shadow-[0_0_10px_rgba(249,115,22,0.6)]"
                />
              )}
              <Icon
                size={17}
                className={cn(
                  "transition-colors",
                  isActive ? "text-flame-600" : "text-ink/55 group-hover:text-ink",
                )}
              />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="m-3 rounded-2xl glass-soft p-3">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-primary text-[13px] font-extrabold text-white shadow-[0_4px_14px_rgba(249,115,22,0.4)]">
            A
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] font-bold text-ink">
              Alex Rivera
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-ink/55">
              <span className="rounded-full border border-flame-300 bg-flame-100 px-1.5 py-[1px] text-[10px] font-extrabold text-flame-700">
                Pro
              </span>
              Plan
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
