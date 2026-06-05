"use client";

import { Plus, Check } from "lucide-react";
import { CHANNELS_DEMO } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function ChannelsCard() {
  return (
    <div className="card-soft p-6">
      <div className="mb-5">
        <div className="text-[15.5px] font-extrabold text-ink">
          Connected Channels
        </div>
        <div className="text-[12.5px] text-ink/55">
          Feru AI listens here and replies on the same channel.
        </div>
      </div>

      <ul className="space-y-2.5">
        {CHANNELS_DEMO.map((c) => (
          <li
            key={c.name}
            className="flex items-center justify-between rounded-xl border border-ink/8 bg-bg-tint/50 px-3.5 py-3"
          >
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-primary text-[13px] font-extrabold text-white shadow-[0_4px_14px_rgba(249,115,22,0.4)]">
                {c.name[0]}
              </span>
              <div>
                <div className="text-[13.5px] font-bold text-ink">{c.name}</div>
                <div className="text-[11.5px] text-ink/55">{c.status}</div>
              </div>
            </div>
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold",
                c.connected
                  ? "border border-emerald-300 bg-emerald-50 text-emerald-700"
                  : "border border-ink/10 bg-white text-ink/55 hover:text-ink",
              )}
            >
              {c.connected ? <Check size={11} /> : <Plus size={11} />}
              {c.connected ? "Connected" : "Connect"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
