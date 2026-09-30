"use client";
// Adapted from HeroUI v3.2.6 (Apache-2.0).
import { ProgressCircle } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({ row: { display: "flex", alignItems: "center", gap: 24 } });
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
        <ProgressCircle key={size} aria-label="Loading" size={size} value={value}>
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
