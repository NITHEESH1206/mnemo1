"use client";

import { useState } from "react";
import {
  Check,
  MessageCircle,
  Mail,
  Send,
  Globe,
  Plus,
  type LucideIcon,
} from "lucide-react";
import { REMINDERS_DEMO } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { GradientButton } from "@/components/ui/GradientButton";

const channelIcon: Record<string, LucideIcon> = {
  whatsapp: MessageCircle,
  telegram: Send,
  email: Mail,
  web: Globe,
};

export function ReminderCard() {
  const [items, setItems] = useState(
    REMINDERS_DEMO.map((r) => ({ ...r })) as Array<{
      title: string;
      time: string;
      channel: string;
      done: boolean;
    }>,
  );

  const toggle = (i: number) => {
    setItems((prev) =>
      prev.map((r, idx) => (idx === i ? { ...r, done: !r.done } : r)),
    );
  };

  return (
    <div className="card-soft p-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <div className="text-[15.5px] font-extrabold text-ink">
            Today’s Reminders
          </div>
          <div className="text-[12.5px] text-ink/55">
            {items.filter((r) => !r.done).length} pending ·{" "}
            {items.filter((r) => r.done).length} complete
          </div>
        </div>
        <button className="btn-glass h-9 w-9 !p-0">
          <Plus size={14} />
        </button>
      </div>

      <ul className="space-y-2">
        {items.map((r, i) => {
          const Icon = channelIcon[r.channel] ?? Globe;
          return (
            <li
              key={r.title}
              className={cn(
                "group flex items-center gap-3 rounded-xl border border-ink/8 bg-white px-3.5 py-3 transition-colors hover:border-flame-300",
                r.done && "opacity-60",
              )}
            >
              <button
                onClick={() => toggle(i)}
                aria-pressed={r.done}
                aria-label={r.done ? "Mark incomplete" : "Mark complete"}
                className={cn(
                  "grid h-5 w-5 shrink-0 place-items-center rounded-[6px] border transition-all",
                  r.done
                    ? "border-flame-500 bg-flame-500"
                    : "border-ink/20 hover:border-flame-400",
                )}
              >
                {r.done && (
                  <Check size={12} className="text-white" strokeWidth={3} />
                )}
              </button>
              <span
                className={cn(
                  "flex-1 text-[14px]",
                  r.done ? "text-ink/45 line-through" : "text-ink font-medium",
                )}
              >
                {r.title}
              </span>
              <span className="hidden sm:flex items-center gap-1.5 text-[11.5px] text-ink/55">
                <Icon size={11} />
                <span className="capitalize">{r.channel}</span>
              </span>
              <span className="text-[12px] font-bold text-ink/65">
                {r.time}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function QuickAddCard() {
  return (
    <div className="card-soft p-6">
      <div className="mb-4">
        <div className="text-[15.5px] font-extrabold text-ink">Quick Add</div>
        <div className="text-[12.5px] text-ink/55">
          Speak or type in plain English — Mnemo figures out the rest.
        </div>
      </div>
      <div className="flex items-center gap-2 rounded-xl border border-ink/8 bg-bg-tint/60 p-2">
        <input
          type="text"
          placeholder="Remind me to…"
          className="flex-1 bg-transparent px-2 py-2 text-[14px] text-ink placeholder:text-ink/40 focus:outline-none"
        />
        <GradientButton size="sm" variant="primary">
          Add
        </GradientButton>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {[
          "Call James tomorrow at 3pm",
          "Pay rent on the 1st every month",
          "Standup prep every Friday 9am",
        ].map((s) => (
          <button
            key={s}
            className="rounded-full border border-ink/10 bg-white px-3 py-1.5 text-[12px] font-medium text-ink/65 transition-colors hover:border-flame-300 hover:text-flame-700"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
