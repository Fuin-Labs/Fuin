import React from "react";

/**
 * Fuin "F" monogram with a steel aperture through the stem — a permission slit in the letterform.
 * Both `/logo.svg` and `/logo-mark.svg` currently point at the same mark; `compact` is reserved
 * for a future simplified reduction if/when the aperture stops surviving at nav-bar sizes.
 */
export function Mark({
  size = 40,
  compact = false,
  className = "",
}: {
  size?: number;
  compact?: boolean;
  className?: string;
}): React.JSX.Element {
  return (
    <img
      src={compact ? "/logo-mark.svg" : "/logo.svg"}
      width={size}
      height={size}
      alt="Fuin"
      className={className}
      style={{ display: "block" }}
    />
  );
}
