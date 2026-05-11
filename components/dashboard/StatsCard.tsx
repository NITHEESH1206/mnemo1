"use client";

import { useEffect, useState } from "react";
import { Flame, TrendingUp } from "lucide-react";

export function StatsCard() {
  const completion = 87;
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / 1400);
      const eased = 1 - Math.pow(1 - t, 3);
      setAnimated(completion * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const circumference = 2 * Math.PI * 42;
  const offset = circumference - (animated / 100) * circumference;

  return (
    <div className="card-soft p-6">
      <div className="mb-5">
        <div className="text-[15.5px] font-extrabold text-ink">
          Memory Stats
        </div>
        <div className="text-[12.5px] text-ink/55">
          This month at a glance.
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative h-[110px] w-[110px] shrink-0">
          <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
            <defs>
              <linearGradient id="ring-grad" x1="0" y1="0" x2="100" y2="100">
                <stop offset="0%" stopColor="#fbbf24" />
                <stop offset="50%" stopColor="#f97316" />
                <stop offset="100%" stopColor="#dc2626" />
              </linearGradient>
            </defs>
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="rgba(15,12,9,0.06)"
              strokeWidth="8"
            />
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="url(#ring-grad)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              style={{
                filter: "drop-shadow(0 0 6px rgba(249,115,22,0.6))",
              }}
            />
          </svg>
          <div className="absolute inset-0 grid place-items-center">
            <div className="text-center">
              <div className="text-[22px] font-extrabold text-ink">
                {Math.round(animated)}%
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-ink/55">
                completion
              </div>
            </div>
          </div>
        </div>

        <div className="grid flex-1 grid-cols-2 gap-3">
          <Tile
            label="Reminders"
            value="148"
            sub="this month"
            icon={<TrendingUp size={14} className="text-flame-600" />}
          />
          <Tile
            label="Streak"
            value="23 days"
            sub="keep it up"
            icon={<Flame size={14} className="text-amber-500" />}
          />
        </div>
      </div>
    </div>
  );
}

function Tile({
  label,
  value,
  sub,
  icon,
}: {
  label: string;
  value: string;
  sub: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-ink/8 bg-bg-tint/50 p-3">
      <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-ink/55">
        {icon}
        {label}
      </div>
      <div className="mt-1 text-[18px] font-extrabold text-ink">{value}</div>
      <div className="text-[11px] text-ink/55">{sub}</div>
    </div>
  );
}
