import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { GlassCard } from "../components/GlassCard";
import { colors, fonts, gradients } from "../theme";

const STEPS = [
  {
    num: "01",
    title: "Connect your world",
    desc: "Link WhatsApp, Telegram, or just open the web app. No new apps to install.",
  },
  {
    num: "02",
    title: "Just talk to it",
    desc: "“Remind me to call James tomorrow at 3pm.” Type or speak — Feru gets it.",
  },
  {
    num: "03",
    title: "It never forgets",
    desc: "Get reminded at the right time, on the right channel. Review on your dashboard.",
  },
];

export const HowItWorksScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleProgress = spring({
    frame,
    fps,
    config: { damping: 24, stiffness: 75 },
    durationInFrames: 40,
  });

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        paddingTop: 60,
      }}
    >
      <div
        style={{
          fontFamily: fonts.display,
          fontWeight: 900,
          fontSize: 78,
          letterSpacing: "-0.035em",
          color: colors.ink.DEFAULT,
          opacity: titleProgress,
          transform: `translateY(${(1 - titleProgress) * 18}px)`,
          marginBottom: 60,
          textAlign: "center",
        }}
      >
        Three steps.{" "}
        <span
          style={{
            background: gradients.warm,
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          Zero friction.
        </span>
      </div>

      <div
        style={{
          display: "flex",
          gap: 36,
          alignItems: "stretch",
          maxWidth: 1500,
        }}
      >
        {STEPS.map((s, i) => {
          const stagger = 30 + i * 50;
          const enter = spring({
            frame: frame - stagger,
            fps,
            config: { damping: 18, stiffness: 82, mass: 0.95 },
            durationInFrames: 50,
          });
          const tx = interpolate(enter, [0, 1], [-44, 0]);
          return (
            <div
              key={i}
              style={{
                opacity: enter,
                transform: `translateX(${tx}px)`,
                flex: 1,
                minWidth: 380,
              }}
            >
              <GlassCard variant="strong" style={{ padding: 36, height: "100%" }}>
                <div
                  style={{
                    fontFamily: fonts.display,
                    fontSize: 92,
                    fontWeight: 900,
                    letterSpacing: "-0.045em",
                    background: gradients.primary,
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    color: "transparent",
                    lineHeight: 1,
                    marginBottom: 14,
                  }}
                >
                  {s.num}
                </div>
                <div
                  style={{
                    fontFamily: fonts.display,
                    fontSize: 34,
                    fontWeight: 700,
                    letterSpacing: "-0.025em",
                    color: colors.ink.DEFAULT,
                    marginBottom: 12,
                  }}
                >
                  {s.title}
                </div>
                <div
                  style={{
                    fontFamily: fonts.sans,
                    fontSize: 21,
                    fontWeight: 500,
                    lineHeight: 1.5,
                    color: colors.ink[700],
                  }}
                >
                  {s.desc}
                </div>
              </GlassCard>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
