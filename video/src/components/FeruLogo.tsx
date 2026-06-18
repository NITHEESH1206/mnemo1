import { fonts, gradients, shadows } from "../theme";

type Props = {
  size?: number;
  withWordmark?: boolean;
  glow?: boolean;
};

export const FeruLogo: React.FC<Props> = ({
  size = 96,
  withWordmark = true,
  glow = false,
}) => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: size * 0.28,
      }}
    >
      {/* The "spark/memory" mark — orange gradient ring with inner amber dot */}
      <div
        style={{
          position: "relative",
          width: size,
          height: size,
          borderRadius: "50%",
          background: gradients.primary,
          boxShadow: glow
            ? `${shadows.glowOrange}, inset 0 2px 0 rgba(255,255,255,0.55), inset 0 -2px 0 rgba(120,53,15,0.25)`
            : "inset 0 2px 0 rgba(255,255,255,0.55), inset 0 -2px 0 rgba(120,53,15,0.25)",
          display: "grid",
          placeItems: "center",
        }}
      >
        {/* Inner cream dot — the "memory pearl" */}
        <div
          style={{
            width: size * 0.36,
            height: size * 0.36,
            borderRadius: "50%",
            background:
              "radial-gradient(circle at 35% 30%, #fff8f0 0%, #fef3e6 60%, #fed7aa 100%)",
            boxShadow:
              "inset 0 -2px 4px rgba(120,53,15,0.18), 0 2px 6px rgba(120,53,15,0.18)",
          }}
        />
        {/* Tiny sheen */}
        <div
          style={{
            position: "absolute",
            top: size * 0.08,
            left: size * 0.18,
            width: size * 0.32,
            height: size * 0.18,
            borderRadius: "50%",
            background:
              "radial-gradient(ellipse, rgba(255,255,255,0.7), transparent 70%)",
            transform: "rotate(-18deg)",
          }}
        />
      </div>

      {withWordmark && (
        <div
          style={{
            fontFamily: fonts.display,
            fontSize: size * 0.7,
            fontWeight: 900,
            letterSpacing: "-0.04em",
            color: "#0c0a09",
            lineHeight: 1,
          }}
        >
          Feru<span style={{ color: "#ea580c" }}>.</span>
          <span style={{ color: "#6b6660", fontWeight: 700, marginLeft: size * 0.1 }}>
            AI
          </span>
        </div>
      )}
    </div>
  );
};
