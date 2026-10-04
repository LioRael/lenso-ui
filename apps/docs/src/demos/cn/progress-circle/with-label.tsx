// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 (Apache-2.0); the label belongs to the progress context.
import { ProgressCircle } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  row: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
});
export function WithLabel() {
  return (
    <ProgressCircle xstyle={styles.row} value={75}>
      <ProgressCircle.Track>
        <ProgressCircle.TrackCircle />
        <ProgressCircle.FillCircle />
      </ProgressCircle.Track>
      <ProgressCircle.Label>已完成 75%</ProgressCircle.Label>
    </ProgressCircle>
  );
}
export default WithLabel;
