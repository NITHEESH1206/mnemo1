import { AbsoluteFill, useCurrentFrame } from "remotion";

// Living gradient backdrop — a slowly breathing warm gradient with four
// drifting color fields (amber, flame, peach, and a faint sky echo of the
// site's hero). Sits behind every scene so cross-fades feel continuous.
export const Background: React.FC = () => {
  const frame = useCurrentFrame();

  // Long, incommensurate periods so the drift never visibly repeats
  const a = Math.sin(frame / 140);
  const b = Math.cos(frame / 185);
  const c = Math.sin(frame / 230);
  const d = Math.cos(frame / 120);

  const angle = 158 + a * 9;
  const midStop = 44 + b * 7;

  return (
    <AbsoluteFill
      style={{
        overflow: "hidden",
        background: `linear-gradient(${angle}deg, #fff8f0 0%, #fef3e6 ${midStop}%, #ffe8cf 100%)`,
      }}
    >
      {/* Amber field — top-left */}
      <div
        style={{
          position: "absolute",
          top: -380 + a * 50,
          left: -320 + b * 60,
          width: 1300,
          height: 1300,
          borderRadius: 9999,
          background:
            "radial-gradient(circle, rgba(251,191,36,0.34) 0%, rgba(251,191,36,0.16) 38%, transparent 68%)",
        }}
      />
      {/* Flame field — bottom-right */}
      <div
        style={{
          position: "absolute",
          bottom: -420 - a * 45,
          right: -360 - c * 55,
          width: 1500,
          height: 1500,
          borderRadius: 9999,
          background:
            "radial-gradient(circle, rgba(249,115,22,0.26) 0%, rgba(234,88,12,0.12) 40%, transparent 70%)",
        }}
      />
      {/* Peach field — mid-left */}
      <div
        style={{
          position: "absolute",
          top: 380 + c * 70,
          left: -480 + d * 40,
          width: 1100,
          height: 1100,
          borderRadius: 9999,
          background:
            "radial-gradient(circle, rgba(253,186,116,0.26) 0%, rgba(253,186,116,0.10) 42%, transparent 70%)",
        }}
      />
      {/* Faint sky echo — top-right (ties to the site's blue-sky hero) */}
      <div
        style={{
          position: "absolute",
          top: -260 + d * 55,
          right: -180 + a * 45,
          width: 980,
          height: 980,
          borderRadius: 9999,
          background:
            "radial-gradient(circle, rgba(125,211,252,0.16) 0%, rgba(125,211,252,0.07) 40%, transparent 68%)",
        }}
      />
      {/* Soft white bloom center — keeps copy legible over the color fields */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 1500,
          height: 950,
          borderRadius: 9999,
          background:
            "radial-gradient(ellipse, rgba(255,248,240,0.72) 0%, rgba(255,248,240,0.3) 50%, transparent 75%)",
        }}
      />
      {/* Subtle grain */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.035,
          mixBlendMode: "multiply",
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.4  0 0 0 0 0.2  0 0 0 0 0.05  0 0 0 0.6 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
          backgroundSize: "240px 240px",
        }}
      />
    </AbsoluteFill>
  );
};
