"use client";

import { cn } from "@/lib/utils";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const today = 2;
const reminderHeights: Record<number, number[]> = {
  0: [40],
  1: [60, 30],
  2: [80, 50, 30],
  3: [40],
  4: [70, 45],
  5: [30],
  6: [],
};

export function CalendarStrip() {
  const monthLabel = new Date().toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="card-soft p-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <div className="text-[15.5px] font-extrabold text-ink">
            Weekly Calendar
          </div>
          <div className="text-[12.5px] text-ink/55">{monthLabel}</div>
        </div>
        <a
          href="#"
          className="text-[12.5px] font-bold text-flame-700 hover:text-flame-800"
        >
          Open calendar →
        </a>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {DAYS.map((d, i) => {
          const bars = reminderHeights[i] ?? [];
          const isToday = i === today;
          return (
            <div
              key={d}
              className={cn(
                "relative flex h-[120px] flex-col justify-end rounded-xl border p-2 transition-colors",
                isToday
                  ? "border-flame-400 bg-flame-50"
                  : "border-ink/8 bg-bg-tint/40 hover:border-ink/15",
              )}
            >
              <div className="absolute top-2 left-2 flex items-center gap-1.5">
                <span
                  className={cn(
                    "text-[11px] font-extrabold uppercase tracking-wider",
                    isToday ? "text-flame-700" : "text-ink/55",
                  )}
                >
                  {d}
                </span>
                {isToday && (
                  <span className="h-1.5 w-1.5 rounded-full bg-flame-500 shadow-[0_0_8px_rgba(249,115,22,0.9)]" />
                )}
              </div>
              <div className="flex flex-col items-stretch gap-1.5">
                {bars.map((h, idx) => (
                  <div
                    key={idx}
                    className="rounded-md bg-gradient-primary opacity-90"
                    style={{ height: `${h * 0.18}px` }}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
