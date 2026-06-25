"use client";

import type { ReactNode } from "react";
import { ChevronLeft, Phone, Video, Mic, Plus } from "lucide-react";

/* Authentic WhatsApp chat UI (brand-accurate greens/beige), reused across the
   hero and the live-demo phones. */

export function WaHeader({ name = "Feru AI" }: { name?: string }) {
  return (
    <div
      className="flex items-center gap-2.5 px-3 py-2.5"
      style={{ backgroundColor: "#075e54" }}
    >
      <ChevronLeft size={17} className="text-white/90" aria-hidden />
      <div className="grid h-8 w-8 place-items-center overflow-hidden rounded-full bg-gradient-primary text-[13px] font-extrabold text-white shadow-[inset_0_0_0_1.5px_rgba(255,255,255,0.5)]">
        F
      </div>
      <div className="leading-tight">
        <div className="text-[12.5px] font-semibold text-white">{name}</div>
        <div className="text-[10px] text-white/75">online</div>
      </div>
      <div className="ml-auto flex items-center gap-3.5 text-white/85">
        <Video size={15} aria-hidden />
        <Phone size={14} aria-hidden />
      </div>
    </div>
  );
}

function Ticks() {
  return (
    <svg
      viewBox="0 0 16 11"
      width="15"
      height="10"
      fill="none"
      aria-hidden
      style={{ display: "inline-block", verticalAlign: "-1px" }}
    >
      <path
        d="M1 6 L3.7 8.7 L8.4 3"
        stroke="#53bdeb"
        strokeWidth="1.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.4 6 L8.1 8.7 L12.8 3"
        stroke="#53bdeb"
        strokeWidth="1.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function WaOut({
  children,
  time = "9:41",
}: {
  children: ReactNode;
  time?: string;
}) {
  return (
    <div
      className="relative ml-auto max-w-[82%] rounded-lg rounded-tr-sm px-2.5 py-1.5 text-[12.5px] leading-snug shadow-[0_1px_0.5px_rgba(11,20,26,0.13)]"
      style={{ backgroundColor: "#d9fdd3", color: "#111b21" }}
    >
      <span>{children}</span>
      <span className="ml-2 inline-flex translate-y-[1px] items-center gap-0.5 text-[9px] text-[#667781]">
        {time}
        <Ticks />
      </span>
    </div>
  );
}

export function WaIn({
  children,
  time = "9:41",
}: {
  children: ReactNode;
  time?: string;
}) {
  return (
    <div
      className="relative mr-auto max-w-[86%] rounded-lg rounded-tl-sm bg-white px-2.5 py-1.5 text-[12.5px] leading-snug shadow-[0_1px_0.5px_rgba(11,20,26,0.13)]"
      style={{ color: "#111b21" }}
    >
      <span>{children}</span>
      <span className="ml-2 inline-block text-[9px] text-[#667781]">{time}</span>
    </div>
  );
}

export function WaInputBar() {
  return (
    <div className="absolute inset-x-2.5 bottom-2.5 flex items-center gap-2">
      <div className="flex flex-1 items-center gap-2 rounded-full bg-white px-3 py-2 text-[11.5px] text-[#8696a0]">
        <Plus size={15} aria-hidden />
        Message
        <span className="ml-auto">😊</span>
      </div>
      <div
        className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-white"
        style={{ backgroundColor: "#00a884" }}
      >
        <Mic size={15} aria-hidden />
      </div>
    </div>
  );
}

/** Beige WhatsApp chat backdrop. */
export const WA_CHAT_BG = "#efe7dd";

/**
 * The WhatsApp-style chat backdrop: warm beige + a faint scattered doodle
 * texture (an original approximation of the default wallpaper, not the
 * trademarked artwork). Spread onto the chat screen container.
 */
export const WA_CHAT_STYLE = {
  backgroundColor: WA_CHAT_BG,
  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='90' height='90' viewBox='0 0 90 90'%3E%3Cg fill='none' stroke='%23d8cdbd' stroke-width='1.3' stroke-linecap='round' opacity='0.55'%3E%3Ccircle cx='18' cy='20' r='6'/%3E%3Cpath d='M58 14l5 5-5 5-5-5z'/%3E%3Cpath d='M12 58h11M17.5 52.5v11'/%3E%3Ccircle cx='68' cy='64' r='4.5'/%3E%3Cpath d='M40 44c2-3 6-3 6 0s-6 6-6 6-6-3-6-6 4-3 6 0z'/%3E%3Cpath d='M74 30h8M78 26v8'/%3E%3C/g%3E%3C/svg%3E\")",
  backgroundSize: "90px 90px",
} as const;
