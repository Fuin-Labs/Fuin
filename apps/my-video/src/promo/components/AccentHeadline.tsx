import React from "react";
import { COLORS } from "../colors";
import { FONTS } from "../fonts";

interface AccentHeadlineProps {
  prefix?: string;
  accent: string;
  suffix?: string;
  fontSize?: number;
}

export const AccentHeadline: React.FC<AccentHeadlineProps> = ({
  prefix,
  accent,
  suffix,
  fontSize = 52,
}) => {
  return (
    <span
      style={{
        fontFamily: FONTS.inter,
        fontWeight: 700,
        fontSize,
        color: COLORS.text,
        lineHeight: 1.3,
      }}
    >
      {prefix && <span>{prefix} </span>}
      <span
        style={{
          fontFamily: FONTS.interItalic,
          fontStyle: "italic",
          fontWeight: 700,
          background: `linear-gradient(135deg, ${COLORS.emeraldDark}, ${COLORS.emerald})`,
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        {accent}
      </span>
      {suffix && <span>{suffix}</span>}
    </span>
  );
};
