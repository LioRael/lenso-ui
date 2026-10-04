// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 (Apache-2.0).
const SIZE_LABELS = {
  lg: "大",
  md: "中",
  sm: "小",
} as const;
import { ProgressCircle } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  row: {
    display: "flex",
    alignItems: "center",
    gap: 24,
  },
});
export function Sizes() {
  return (
    <div {...stylex.props(styles.row)}>
      {(
        [
          ["sm", 40],
          ["md", 60],
          ["lg", 80],
        ] as const
      ).map(([size, value]) => (
        <ProgressCircle key={size} aria-label={SIZE_LABELS[size]} size={size} value={value}>
          <ProgressCircle.Track>
            <ProgressCircle.TrackCircle />
            <ProgressCircle.FillCircle />
          </ProgressCircle.Track>
        </ProgressCircle>
      ))}
    </div>
  );
}
export default Sizes;
