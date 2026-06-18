import { CSSProperties } from "react";
import { fonts, gradients } from "../theme";

type Props = {
  children: React.ReactNode;
  size?: number;
  weight?: number;
  style?: CSSProperties;
  variant?: "primary" | "warm" | "dark";
};

export const GradientText: React.FC<Props> = ({
  children,
  size = 100,
  weight = 900,
  style,
  variant = "primary",
}) => {
  const bg =
    variant === "primary"
      ? gradients.primary
      : variant === "warm"
        ? gradients.warm
        : gradients.dark;

  return (
    <span
      style={{
        fontFamily: fonts.display,
        fontSize: size,
        fontWeight: weight,
        letterSpacing: "-0.035em",
        lineHeight: 1.02,
        background: bg,
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent",
        display: "inline-block",
        ...style,
      }}
    >
      {children}
    </span>
  );
};
