import { CSSProperties } from "react";
import { shadows } from "../theme";

type Props = {
  children: React.ReactNode;
  style?: CSSProperties;
  variant?: "soft" | "strong";
};

export const GlassCard: React.FC<Props> = ({
  children,
  style,
  variant = "strong",
}) => {
  return (
    <div
      style={{
        position: "relative",
        background:
          variant === "strong"
            ? "linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.72) 100%)"
            : "linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.4) 100%)",
        border: "1.5px solid rgba(255,255,255,0.85)",
        borderRadius: 32,
        boxShadow: variant === "strong" ? shadows.glassStrong : shadows.glass,
        ...style,
      }}
    >
      {children}
    </div>
  );
};
