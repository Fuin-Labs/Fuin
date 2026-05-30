import React from "react";

/**
 * FUIN logotype drawn in the same geometric bar-language as the F monogram
 * (thick rectangular strokes, ~24-unit bar width, the lime aperture slit on
 * the F). The leading F matches the logo's proportions so the mark and the
 * wordmark read as one piece. Bars inherit `currentColor`; aperture is lime.
 */
export function FuinWordmark({
  height = 28,
  className = "",
  apertureColor = "#c1e859",
}: {
  height?: number;
  className?: string;
  apertureColor?: string;
}): React.JSX.Element {
  // viewBox 300 x 102, letters built from 24-wide bars.
  const w = (300 / 102) * height;
  return (
    <svg
      viewBox="0 0 300 102"
      width={w}
      height={height}
      role="img"
      aria-label="Fuin"
      className={className}
      style={{ display: "block" }}
    >
      <g fill="currentColor">
        {/* F — matches the monogram proportions (long top arm, shorter mid arm) */}
        <rect x="0" y="0" width="24" height="102" />
        <rect x="24" y="0" width="47" height="23" />
        <rect x="24" y="38" width="31" height="21" />

        {/* U */}
        <rect x="93" y="0" width="24" height="102" />
        <rect x="137" y="0" width="24" height="102" />
        <rect x="93" y="78" width="68" height="24" />

        {/* I */}
        <rect x="183" y="0" width="24" height="102" />

        {/* N */}
        <rect x="229" y="0" width="24" height="102" />
        <rect x="273" y="0" width="24" height="102" />
        <polygon points="253,0 273,0 297,102 277,102" />
      </g>

      {/* lime aperture slit on the F's lower stem — the brand's "live line" */}
      <rect x="0" y="72" width="24" height="6" fill={apertureColor} />
    </svg>
  );
}
