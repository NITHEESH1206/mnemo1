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
          width="30"
          height="30"
          viewBox="0 0 32 32"
          fill="none"
          aria-hidden="true"
          className="drop-shadow-[0_0_12px_rgba(249,115,22,0.55)]"
        >
          <defs>
            <linearGradient id="mnemo-grad" x1="0" y1="0" x2="32" y2="32">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="50%" stopColor="#fb923c" />
              <stop offset="100%" stopColor="#ea580c" />
            </linearGradient>
          </defs>
          <path
            d="M5 25V8.5C5 7.67 5.67 7 6.5 7c.55 0 1.06.3 1.32.78L13.5 18 19.18 7.78A1.5 1.5 0 0 1 20.5 7c.83 0 1.5.67 1.5 1.5V25"
            stroke="url(#mnemo-grad)"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="26.5" cy="8.5" r="3" fill="url(#mnemo-grad)" />
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
