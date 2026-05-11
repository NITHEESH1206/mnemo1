"use client";

import { cn } from "@/lib/utils";

export function MarqueeStrip({
  items,
  className,
}: {
  items: ReadonlyArray<string>;
  className?: string;
}) {
  const doubled = [...items, ...items];

  return (
    <div className={cn("marquee-fade relative w-full overflow-hidden", className)}>
      <div
        className="flex w-max animate-marquee gap-12 motion-reduce:animate-none"
        aria-label="Supported integrations"
      >
        {doubled.map((label, i) => (
          <LogoItem key={`${label}-${i}`} label={label} />
        ))}
      </div>
    </div>
  );
}

function LogoItem({ label }: { label: string }) {
  return (
    <div className="group flex shrink-0 items-center gap-2.5 text-ink/50 transition-colors duration-300 hover:text-ink">
      <span
        aria-hidden
        className="grid h-8 w-8 place-items-center rounded-lg bg-white shadow-[0_2px_8px_rgba(120,53,15,0.1),inset_0_1px_0_rgba(255,255,255,0.9)] text-[12px] font-extrabold text-flame-600 transition-colors group-hover:text-flame-700"
      >
        {label.slice(0, 1)}
      </span>
      <span className="text-[15px] font-semibold tracking-tight">{label}</span>
    </div>
  );
}
