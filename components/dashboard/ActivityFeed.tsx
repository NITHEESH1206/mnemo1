"use client";

import { ACTIVITY_DEMO } from "@/lib/constants";

export function ActivityFeed() {
  return (
    <div className="card-soft p-6">
      <div className="mb-5">
        <div className="text-[15.5px] font-extrabold text-ink">
          Recent Activity
        </div>
        <div className="text-[12.5px] text-ink/55">
          Last actions Mnemo took on your behalf.
        </div>
      </div>

      <ul className="space-y-3.5">
        {ACTIVITY_DEMO.map((a) => (
          <li key={a.text} className="flex items-start gap-3">
            <span
              aria-hidden
              className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-ink/8 bg-bg-tint/60 text-[14px]"
            >
              {a.icon}
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[13.5px] text-ink">{a.text}</div>
              <div className="text-[11.5px] text-ink/55">{a.ago} ago</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
