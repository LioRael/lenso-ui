"use client";
// Adapted from HeroUI v3.2.6 (Apache-2.0).
import { ProgressCircle } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({ row: { display: "flex", alignItems: "center", gap: 24 } });
export function Colors() {
  return (
    <div {...stylex.props(styles.row)}>
      {(["default", "accent", "success", "warning", "danger"] as const).map((color) => (
        <ProgressCircle key={color} aria-label={color} color={color} value={60}>
          <ProgressCircle.Track>
            <ProgressCircle.TrackCircle />
            <ProgressCircle.FillCircle />
          </ProgressCircle.Track>
        </ProgressCircle>
      ))}
    </div>
  );
}
export default Colors;
