import { cn } from "@/lib/utils";

export function Logo({
  className,
  showText = true,
}: {
  className?: string;
  showText?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span className="relative">
        <svg
          width="28"
          height="28"
          viewBox="0 0 32 32"
          fill="none"
          aria-hidden="true"
        >
          {/* rounded monoline F */}
          <g
            stroke="#f97316"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12.5 9.5 V 23.5" />
            <path d="M12.5 9.5 H 20.5" />
            <path d="M12.5 16.3 H 18" />
          </g>
          {/* spark dot */}
          <circle cx="24" cy="8" r="2.4" fill="#f97316" />
        </svg>
      </span>
      {showText && (
        <span className="text-[19px] font-extrabold tracking-tight text-ink">
          Feru AI
        </span>
      )}
    </span>
  );
}
