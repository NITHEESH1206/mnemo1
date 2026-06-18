import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { GlassCard } from "../components/GlassCard";
import { colors, fonts, gradients } from "../theme";

const FEATURES = [
  {
    icon: "🧠",
    title: "Universal Memory",
    desc: "Captures reminders, ideas, and tasks. Nothing slips through.",
  },
  {
    icon: "📱",
    title: "Multi-Channel",
    desc: "WhatsApp, Telegram, Email, and a full web dashboard.",
  },
  {
    icon: "🎙️",
    title: "Voice-to-Action",
    desc: "Just speak. Feru transcribes, understands, and acts.",
  },
  {
    icon: "🔁",
    title: "Smart Recurrence",
    desc: "Daily, weekly, monthly. Set it once. Forever handled.",
  },
  {
    icon: "📅",
    title: "Calendar Sync",
    desc: "Two-way sync with Google, Outlook & Apple Calendar.",
  },
  {
    icon: "👥",
    title: "Team Memory",
    desc: "Send reminders to teammates. Track. Keep aligned.",
  },
];

export const FeaturesScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Title
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
          marginBottom: 16,
          textAlign: "center",
        }}
      >
        Built to{" "}
        <span
          style={{
            background: gradients.warm,
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          never forget
        </span>
        .
      </div>
      <div
        style={{
          fontFamily: fonts.sans,
          fontSize: 26,
          fontWeight: 500,
          color: colors.ink[500],
          opacity: titleProgress * 0.85,
          marginBottom: 50,
          textAlign: "center",
        }}
      >
        Six pieces that work the way your brain wishes it did.
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 380px))",
          gap: 28,
          maxWidth: 1280,
        }}
      >
        {FEATURES.map((f, i) => {
          const stagger = 50 + i * 18;
          const enter = spring({
            frame: frame - stagger,
            fps,
            config: { damping: 18, stiffness: 82, mass: 0.95 },
            durationInFrames: 45,
          });
          const ty = interpolate(enter, [0, 1], [34, 0]);
          const sc = interpolate(enter, [0, 1], [0.94, 1]);
          return (
            <div
              key={i}
              style={{
                opacity: enter,
                transform: `translateY(${ty}px) scale(${sc})`,
              }}
            >
              <GlassCard variant="strong" style={{ padding: 28, height: "100%" }}>
                <div
                  style={{
                    fontSize: 44,
                    marginBottom: 14,
                    filter: "drop-shadow(0 4px 8px rgba(249,115,22,0.25))",
                  }}
                >
                  {f.icon}
                </div>
                <div
                  style={{
                    fontFamily: fonts.display,
                    fontSize: 28,
                    fontWeight: 700,
                    letterSpacing: "-0.025em",
                    color: colors.ink.DEFAULT,
                    marginBottom: 8,
                  }}
                >
                  {f.title}
                </div>
                <div
                  style={{
                    fontFamily: fonts.sans,
                    fontSize: 19,
                    fontWeight: 500,
                    lineHeight: 1.45,
                    color: colors.ink[700],
                  }}
                >
                  {f.desc}
                </div>
              </GlassCard>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
