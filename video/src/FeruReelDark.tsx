import React from "react";
import {
  AbsoluteFill,
  Sequence,
  Audio,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";

const { fontFamily } = loadFont("normal", {
  weights: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

const INCLUDE_AUDIO = true;

const ORANGE = "#f97316";
const AMBER = "#fbbf24";
const EMBER = "#ea580c";

/* ---------- motion helpers ---------- */
const Pop: React.FC<{
  delay?: number;
  children: React.ReactNode;
  damping?: number;
  y?: number;
  from?: number;
}> = ({ delay = 0, children, damping = 14, y = 40, from = 0.8 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({
    frame: frame - delay,
    fps,
    config: { damping, stiffness: 130, mass: 0.8 },
  });
  const scale = interpolate(s, [0, 1], [from, 1]);
  const ty = interpolate(s, [0, 1], [y, 0]);
  const opacity = interpolate(frame - delay, [0, 9], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div style={{ transform: `translateY(${ty}px) scale(${scale})`, opacity }}>
      {children}
    </div>
  );
};

const Typewriter: React.FC<{ text: string; start: number; cps?: number }> = ({
  text,
  start,
  cps = 16,
}) => {
  const frame = useCurrentFrame();
  const n = Math.max(0, Math.floor(((frame - start) * cps) / 30));
  const shown = text.slice(0, n);
  const blink = Math.floor(frame / 14) % 2 === 0;
  return (
    <span>
      {shown}
      <span style={{ opacity: blink ? 1 : 0, color: ORANGE }}>|</span>
    </span>
  );
};

const ReelLogo: React.FC<{ size?: number; color?: string }> = ({
  size = 120,
  color = ORANGE,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    style={{ filter: `drop-shadow(0 0 18px ${color}aa)` }}
  >
    <g
      stroke={color}
      strokeWidth={5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12.5 9.5 V 23.5" />
      <path d="M12.5 9.5 H 20.5" />
      <path d="M12.5 16.3 H 18" />
    </g>
    <circle cx="24" cy="8" r="2.4" fill={color} />
  </svg>
);

/* ---------- dark background with warm glows ---------- */
const Bg: React.FC = () => {
  const frame = useCurrentFrame();
  const d = Math.sin(frame / 60) * 40;
  return (
    <AbsoluteFill style={{ background: "#070606" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse 60% 40% at ${78 + d / 30}% 8%, rgba(249,115,22,0.32), transparent 55%),
            radial-gradient(ellipse 70% 50% at 12% 96%, rgba(251,191,36,0.2), transparent 60%),
            radial-gradient(ellipse 50% 40% at 92% 100%, rgba(234,88,12,0.18), transparent 60%)`,
        }}
      />
      {/* faint tile grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.06,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "120px 120px",
        }}
      />
    </AbsoluteFill>
  );
};

const Center: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill
    style={{
      justifyContent: "center",
      alignItems: "center",
      padding: 90,
      textAlign: "center",
      fontFamily,
    }}
  >
    {children}
  </AbsoluteFill>
);

const H: React.FC<{
  children: React.ReactNode;
  size?: number;
  glow?: boolean;
}> = ({ children, size = 92, glow }) => (
  <div
    style={{
      fontSize: size,
      fontWeight: 700,
      letterSpacing: "-0.02em",
      lineHeight: 1.05,
      color: "#fff",
      textShadow: glow ? "0 0 40px rgba(249,115,22,0.5)" : "none",
    }}
  >
    {children}
  </div>
);

/* light streak / comet */
const Streak: React.FC<{ delay: number }> = ({ delay }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - delay, [0, 30], [-30, 130], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        position: "absolute",
        top: "52%",
        left: `${p}%`,
        width: 520,
        height: 6,
        transform: "translateX(-50%)",
        borderRadius: 999,
        background:
          "linear-gradient(90deg, transparent, #fbbf24, #f97316, transparent)",
        filter: "blur(3px)",
        boxShadow: "0 0 40px rgba(249,115,22,0.8)",
      }}
    />
  );
};

/* ============================ SCENES ============================ */

const SceneHook: React.FC = () => {
  return (
    <Center>
      <Pop delay={2} y={20} from={0.92}>
        <H size={96} glow>
          You’ll forget this
          <br />
          by tonight.
        </H>
      </Pop>
      <div style={{ height: 70 }} />
      <Pop delay={16} y={40} damping={16}>
        <div
          style={{
            position: "relative",
            width: 860,
            padding: "40px 46px",
            borderRadius: 999,
            textAlign: "left",
            fontSize: 46,
            fontWeight: 500,
            color: "#fff",
            background: "rgba(255,255,255,0.04)",
            border: "1.5px solid rgba(249,115,22,0.55)",
            boxShadow:
              "0 0 60px rgba(249,115,22,0.35), inset 0 0 30px rgba(249,115,22,0.12)",
            overflow: "hidden",
          }}
        >
          <Typewriter text="remind me to pay rent on the 1st" start={24} />
        </div>
      </Pop>
    </Center>
  );
};

const SceneBrand: React.FC = () => (
  <Center>
    <Pop delay={2} y={36}>
      <H size={74}>Unless it lives where you already are.</H>
    </Pop>
    <div style={{ height: 80 }} />
    <Pop delay={24} y={50} damping={11}>
      <div style={{ display: "flex", alignItems: "center", gap: 26 }}>
        <ReelLogo size={140} />
        <span
          style={{
            fontSize: 120,
            fontWeight: 700,
            letterSpacing: "-0.03em",
            color: "#fff",
            textShadow: "0 0 50px rgba(249,115,22,0.5)",
          }}
        >
          Feru AI
        </span>
      </div>
    </Pop>
  </Center>
);

const SceneOrbit: React.FC = () => {
  const frame = useCurrentFrame();
  const labels = ["WhatsApp", "Telegram", "Email", "Web"];
  const R = 300;
  return (
    <Center>
      <div style={{ position: "absolute", top: 360 }}>
        <div style={{ position: "relative", width: 700, height: 700 }}>
          {/* glow ring */}
          <div
            style={{
              position: "absolute",
              inset: 120,
              borderRadius: "50%",
              border: "1.5px solid rgba(249,115,22,0.25)",
              boxShadow: "0 0 80px rgba(249,115,22,0.25) inset",
            }}
          />
          {/* center logo */}
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%,-50%)",
            }}
          >
            <Pop delay={4} from={0.5} damping={10}>
              <div
                style={{
                  width: 150,
                  height: 150,
                  borderRadius: 38,
                  display: "grid",
                  placeItems: "center",
                  background: "rgba(255,255,255,0.05)",
                  border: "1.5px solid rgba(249,115,22,0.6)",
                  boxShadow: "0 0 60px rgba(249,115,22,0.5)",
                }}
              >
                <ReelLogo size={92} />
              </div>
            </Pop>
          </div>
          {/* orbiting pills */}
          {labels.map((l, i) => {
            const a = (i / labels.length) * Math.PI * 2 + frame / 70;
            const x = Math.cos(a) * R;
            const y = Math.sin(a) * R;
            return (
              <div
                key={l}
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                }}
              >
                <Pop delay={14 + i * 6} from={0.6} damping={11}>
                  <div
                    style={{
                      padding: "16px 30px",
                      borderRadius: 999,
                      fontSize: 34,
                      fontWeight: 600,
                      color: "#fff",
                      background: "rgba(255,255,255,0.06)",
                      border: "1.5px solid rgba(251,191,36,0.5)",
                      boxShadow: "0 0 30px rgba(249,115,22,0.3)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {l}
                  </div>
                </Pop>
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ position: "absolute", bottom: 230 }}>
        <Pop delay={30} y={30}>
          <H size={80} glow>
            One memory. Every app.
          </H>
        </Pop>
      </div>
    </Center>
  );
};

const SceneCapture: React.FC = () => {
  const tiles = ["Text it.", "Talk it.", "Screenshot it."];
  return (
    <Center>
      <Pop delay={2} y={36}>
        <H size={84}>Capture it any way.</H>
      </Pop>
      <div style={{ height: 64 }} />
      <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
        {tiles.map((t, i) => (
          <Pop key={t} delay={14 + i * 12} y={44} damping={12} from={0.7}>
            <div
              style={{
                width: 620,
                padding: "30px 0",
                borderRadius: 28,
                fontSize: 50,
                fontWeight: 600,
                color: "#fff",
                background: "rgba(255,255,255,0.05)",
                border: `1.5px solid ${i === 2 ? "rgba(249,115,22,0.8)" : "rgba(255,255,255,0.16)"}`,
                boxShadow:
                  i === 2 ? "0 0 50px rgba(249,115,22,0.45)" : "none",
              }}
            >
              {t}
            </div>
          </Pop>
        ))}
      </div>
    </Center>
  );
};

const SceneNumber: React.FC = () => (
  <Center>
    <div style={{ position: "relative" }}>
      <Pop delay={2} from={0.5} damping={9}>
        <div
          style={{
            fontSize: 560,
            fontWeight: 700,
            lineHeight: 1,
            background: "linear-gradient(180deg,#fde68a,#f97316 60%,#ea580c)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
            filter: "drop-shadow(0 0 60px rgba(249,115,22,0.55))",
          }}
        >
          1
        </div>
      </Pop>
    </div>
    <Pop delay={20} y={30}>
      <H size={62}>app for everything you can’t forget.</H>
    </Pop>
  </Center>
);

const SceneChat: React.FC = () => (
  <Center>
    <Streak delay={0} />
    <Pop delay={12} y={60} damping={14}>
      <div
        style={{
          width: 760,
          borderRadius: 44,
          padding: 36,
          background: "rgba(255,255,255,0.045)",
          border: "1.5px solid rgba(249,115,22,0.35)",
          boxShadow: "0 0 70px rgba(249,115,22,0.3)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            paddingBottom: 22,
            borderBottom: "1px solid rgba(255,255,255,0.1)",
            marginBottom: 18,
          }}
        >
          <ReelLogo size={52} />
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: 32, fontWeight: 600, color: "#fff" }}>
              Feru AI
            </div>
            <div style={{ fontSize: 22, color: "#34d399", fontWeight: 600 }}>
              online
            </div>
          </div>
        </div>
        <div
          style={{
            alignSelf: "flex-end",
            marginLeft: "auto",
            maxWidth: 560,
            marginBottom: 14,
            padding: "24px 30px",
            borderRadius: 30,
            borderBottomRightRadius: 10,
            fontSize: 38,
            fontWeight: 500,
            color: "#fff",
            background: "linear-gradient(135deg,#fb923c,#ea580c)",
            boxShadow: "0 0 30px rgba(249,115,22,0.4)",
          }}
        >
          remind me to call mom at 6pm
        </div>
        <div
          style={{
            maxWidth: 580,
            padding: "24px 30px",
            borderRadius: 30,
            borderBottomLeftRadius: 10,
            fontSize: 38,
            fontWeight: 500,
            color: "#fff",
            background: "rgba(255,255,255,0.08)",
          }}
        >
          Got it — I’ll ping you at 6:00 PM ✓
        </div>
      </div>
    </Pop>
    <div style={{ height: 56 }} />
    <Pop delay={30} y={26}>
      <H size={62} glow>
        Reminds you at the perfect time.
      </H>
    </Pop>
  </Center>
);

const SceneCTA: React.FC = () => {
  const frame = useCurrentFrame();
  const pulse = 1 + Math.sin(frame / 9) * 0.022;
  return (
    <Center>
      <Streak delay={0} />
      <Pop delay={4} y={50} damping={10}>
        <div
          style={{
            fontSize: 130,
            fontWeight: 700,
            letterSpacing: "-0.03em",
            lineHeight: 1,
            background: "linear-gradient(135deg,#fde68a,#f97316 55%,#ea580c)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
            filter: "drop-shadow(0 0 50px rgba(249,115,22,0.5))",
          }}
        >
          Free your
          <br />
          mind.
        </div>
      </Pop>
      <div style={{ height: 40 }} />
      <Pop delay={20} y={30}>
        <H size={50}>Try Feru AI free for 7 days</H>
      </Pop>
      <div style={{ height: 40 }} />
      <Pop delay={30} y={36} damping={11}>
        <div
          style={{
            transform: `scale(${pulse})`,
            display: "inline-flex",
            alignItems: "center",
            gap: 14,
            padding: "26px 44px",
            borderRadius: 999,
            fontSize: 46,
            fontWeight: 700,
            color: "#fff",
            background: "linear-gradient(135deg,#fb923c,#ea580c)",
            boxShadow: "0 0 60px rgba(249,115,22,0.6)",
          }}
        >
          Message us on WhatsApp →
        </div>
      </Pop>
      <div style={{ height: 46 }} />
      <Pop delay={42} y={22} from={0.85}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <ReelLogo size={60} />
          <span style={{ fontSize: 38, fontWeight: 600, color: "#fff" }}>
            feruai.com · @feru.ai
          </span>
        </div>
      </Pop>
    </Center>
  );
};

/* ============================ ROOT ============================ */

export const FeruReelDark: React.FC = () => {
  return (
    <AbsoluteFill>
      <Bg />
      <Sequence from={0} durationInFrames={130}>
        <SceneHook />
      </Sequence>
      <Sequence from={130} durationInFrames={120}>
        <SceneBrand />
      </Sequence>
      <Sequence from={250} durationInFrames={180}>
        <SceneOrbit />
      </Sequence>
      <Sequence from={430} durationInFrames={130}>
        <SceneCapture />
      </Sequence>
      <Sequence from={560} durationInFrames={120}>
        <SceneNumber />
      </Sequence>
      <Sequence from={680} durationInFrames={120}>
        <SceneChat />
      </Sequence>
      <Sequence from={800} durationInFrames={100}>
        <SceneCTA />
      </Sequence>

      {INCLUDE_AUDIO && (
        <>
          <Audio src={staticFile("music.mp3")} volume={0.18} />
          <Audio src={staticFile("voiceover.mp3")} />
        </>
      )}
    </AbsoluteFill>
  );
};
