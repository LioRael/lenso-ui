"use client";
// Adapted from HeroUI v3.2.6 (Apache-2.0).
import { ProgressCircle } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  track: { width: 56, height: 56 },
  background: { stroke: "light-dark(oklch(92.2% 0 0), oklch(26.9% 0 0))" },
  fill: { stroke: "light-dark(oklch(37.1% 0 0), oklch(87% 0 0))" },
});
export function CustomStyles() {
  return (
    <ProgressCircle aria-label="Sync progress" value={68}>
      <ProgressCircle.Track xstyle={styles.track}>
        <ProgressCircle.TrackCircle xstyle={styles.background} />
        <ProgressCircle.FillCircle xstyle={styles.fill} strokeLinecap="round" />
      </ProgressCircle.Track>
    </ProgressCircle>
  );
}
export default CustomStyles;
