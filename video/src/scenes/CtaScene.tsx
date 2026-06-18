import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { FeruLogo } from "../components/FeruLogo";
import { colors, fonts, gradients } from "../theme";

export const CtaScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Big headline
  const head = spring({
    frame,
    fps,
    config: { damping: 20, stiffness: 80 },
    durationInFrames: 45,
  });

  // Logo
  const logo = spring({
    frame: frame - 40,
    fps,
    config: { damping: 16, stiffness: 95 },
    durationInFrames: 40,
  });

  // CTA URL + button
  const cta = spring({
    frame: frame - 75,
    fps,
    config: { damping: 22, stiffness: 85 },
    durationInFrames: 40,
  });

  // Sub
  const sub = spring({
    frame: frame - 100,
    fps,
    config: { damping: 22, stiffness: 85 },
    durationInFrames: 35,
  });

  // Gentle outro fade (scene runs 258 frames with the cross-fade padding)
  const outro = interpolate(frame, [230, 256], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Button shine
  const shine = (frame % 110) / 110;

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        opacity: outro,
      }}
    >
      {/* Bloom behind */}
      <div
        style={{
          position: "absolute",
          width: 1400,
          height: 1400,
          borderRadius: 9999,
          background:
            "radial-gradient(circle, rgba(251,191,36,0.38) 0%, rgba(249,115,22,0.15) 35%, transparent 70%)",
          transform: `scale(${0.6 + head * 0.4})`,
          opacity: head,
          filter: "blur(8px)",
        }}
      />

      {/* Headline */}
      <div
        style={{
          fontFamily: fonts.display,
          fontWeight: 900,
          fontSize: 148,
          letterSpacing: "-0.045em",
          lineHeight: 1.0,
          textAlign: "center",
          opacity: head,
          transform: `translateY(${(1 - head) * 30}px) scale(${0.94 + head * 0.06})`,
          marginBottom: 32,
        }}
      >
        <span style={{ color: colors.ink.DEFAULT }}>Never forget </span>
        <span
          style={{
            background: gradients.warm,
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          again.
        </span>
      </div>

      {/* Logo */}
      <div
        style={{
          opacity: logo,
          transform: `scale(${0.88 + logo * 0.12})`,
          marginBottom: 30,
        }}
      >
        <FeruLogo size={108} withWordmark glow />
      </div>

      {/* CTA pill */}
      <div
        style={{
          opacity: cta,
          transform: `translateY(${(1 - cta) * 14}px) scale(${0.92 + cta * 0.08})`,
          position: "relative",
          isolation: "isolate",
          overflow: "hidden",
          padding: "22px 50px",
          borderRadius: 9999,
          fontFamily: fonts.display,
          fontWeight: 700,
          fontSize: 36,
          color: "#fff",
          letterSpacing: "-0.015em",
          background: gradients.primary,
          border: "1px solid rgba(255,255,255,0.4)",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.6), 0 26px 50px -12px rgba(234,88,12,0.55), 0 2px 4px rgba(120,53,15,0.2)",
        }}
      >
        Start free at feruai.com
        {/* shine sweep */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(100deg, transparent 30%, rgba(255,255,255,0.55) 50%, transparent 70%)",
            transform: `translateX(${-100 + shine * 200}%)`,
            pointerEvents: "none",
          }}
        />
      </div>

      <div
        style={{
          marginTop: 26,
          fontFamily: fonts.sans,
          fontSize: 22,
          fontWeight: 500,
          color: colors.ink[500],
          opacity: sub,
          transform: `translateY(${(1 - sub) * 10}px)`,
        }}
      >
        No card required &nbsp;·&nbsp; Free forever plan &nbsp;·&nbsp; Works on WhatsApp, Telegram, Email
      </div>
    </AbsoluteFill>
  );
};
