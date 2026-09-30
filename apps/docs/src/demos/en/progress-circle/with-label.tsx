"use client";
// Adapted from HeroUI v3.2.6 (Apache-2.0); the label belongs to the progress context.
import { ProgressCircle } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({ row: { display: "flex", alignItems: "center", gap: 12 } });
export function WithLabel() {
  return (
    <ProgressCircle xstyle={styles.row} value={75}>
      <ProgressCircle.Track>
        <ProgressCircle.TrackCircle />
        <ProgressCircle.FillCircle />
      </ProgressCircle.Track>
      <ProgressCircle.Label>75% Complete</ProgressCircle.Label>
    </ProgressCircle>
  );
}
export default WithLabel;
