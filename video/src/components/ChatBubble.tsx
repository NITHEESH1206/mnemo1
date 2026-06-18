import { CSSProperties } from "react";
import { fonts, shadows } from "../theme";

type Props = {
  text: string;
  align?: "left" | "right";
  accent?: string;
  style?: CSSProperties;
  voice?: boolean;
};

export const ChatBubble: React.FC<Props> = ({
  text,
  align = "left",
  accent = "#fb923c",
  style,
  voice = false,
}) => {
  return (
    <div
      style={{
        position: "relative",
        background:
          align === "right"
            ? `linear-gradient(135deg, ${accent} 0%, #ea580c 100%)`
            : "linear-gradient(135deg, rgba(255,255,255,0.96) 0%, rgba(255,255,255,0.86) 100%)",
        color: align === "right" ? "#fff" : "#0c0a09",
        padding: voice ? "20px 26px" : "22px 28px",
        borderRadius: 28,
        borderTopLeftRadius: align === "left" ? 8 : 28,
        borderTopRightRadius: align === "right" ? 8 : 28,
        fontFamily: fonts.sans,
        fontWeight: 500,
        fontSize: 28,
        letterSpacing: "-0.01em",
        lineHeight: 1.32,
        boxShadow: shadows.glass,
        border: align === "right"
          ? "1px solid rgba(255,255,255,0.35)"
          : "1px solid rgba(255,255,255,0.85)",
        maxWidth: 520,
        display: "flex",
        alignItems: "center",
        gap: 14,
        ...style,
      }}
    >
      {voice && (
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                width: 4,
                height: [14, 22, 18, 10][i],
                background: align === "right" ? "#fff" : accent,
                borderRadius: 4,
                opacity: 0.9,
              }}
            />
          ))}
        </div>
      )}
      <span>{text}</span>
    </div>
  );
};
