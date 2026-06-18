type ChannelKind = "whatsapp" | "telegram" | "email" | "web";

type Props = {
  kind: ChannelKind;
  size?: number;
};

// Hand-built SVG glyphs (no asset deps) for the four channels
export const ChannelIcon: React.FC<Props> = ({ kind, size = 96 }) => {
  const bg: Record<ChannelKind, string> = {
    whatsapp: "linear-gradient(135deg, #25d366 0%, #128c7e 100%)",
    telegram: "linear-gradient(135deg, #4cb6f4 0%, #0088cc 100%)",
    email: "linear-gradient(135deg, #fb923c 0%, #ea580c 100%)",
    web: "linear-gradient(135deg, #6b6660 0%, #0c0a09 100%)",
  };

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.28,
        background: bg[kind],
        display: "grid",
        placeItems: "center",
        boxShadow:
          "inset 0 2px 0 rgba(255,255,255,0.4), inset 0 -2px 0 rgba(0,0,0,0.15), 0 12px 28px -10px rgba(0,0,0,0.35)",
      }}
    >
      <Glyph kind={kind} size={size * 0.55} />
    </div>
  );
};

const Glyph: React.FC<{ kind: ChannelKind; size: number }> = ({ kind, size }) => {
  const s = { width: size, height: size, color: "#fff" };
  if (kind === "whatsapp") {
    return (
      <svg viewBox="0 0 24 24" style={s} fill="currentColor">
        <path d="M17.5 14.4c-.3-.1-1.6-.8-1.9-.9-.3-.1-.4-.1-.6.1-.2.3-.7.9-.9 1.1-.2.1-.3.2-.6 0-.3-.1-1.2-.4-2.3-1.4-.8-.7-1.4-1.7-1.6-1.9-.2-.3 0-.5.1-.6.1-.1.3-.3.4-.5.1-.1.2-.3.3-.4.1-.1 0-.3 0-.5s-.6-1.5-.9-2.1c-.2-.5-.5-.5-.6-.5h-.6c-.2 0-.5.1-.7.3s-.9.9-.9 2.1c0 1.3.9 2.5 1.1 2.7.1.2 1.8 2.8 4.4 3.9 2.6 1.1 2.6.7 3.1.7.5 0 1.5-.6 1.7-1.2.2-.6.2-1.2.1-1.3-.1-.1-.3-.2-.6-.3zM12 2C6.5 2 2 6.5 2 12c0 1.8.5 3.5 1.3 5L2 22l5.2-1.4c1.5.8 3.1 1.2 4.8 1.2 5.5 0 10-4.5 10-10S17.5 2 12 2z" />
      </svg>
    );
  }
  if (kind === "telegram") {
    return (
      <svg viewBox="0 0 24 24" style={s} fill="currentColor">
        <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z" />
      </svg>
    );
  }
  if (kind === "email") {
    return (
      <svg viewBox="0 0 24 24" style={s} fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
        <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
        <path d="M3 7l9 7 9-7" />
      </svg>
    );
  }
  // web
  return (
    <svg viewBox="0 0 24 24" style={s} fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3a14 14 0 010 18" />
      <path d="M12 3a14 14 0 000 18" />
    </svg>
  );
};
