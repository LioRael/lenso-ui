"use client";
// Adapted from HeroUI v3.2.6 (Apache-2.0).
import { ProgressBar } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({ progress: { width: 256 } });
export function WithoutLabel() {
  return (
    <ProgressBar aria-label="Loading progress" xstyle={styles.progress} value={45}>
      <ProgressBar.Track>
        <ProgressBar.Fill />
      </ProgressBar.Track>
    </ProgressBar>
  );
}
export default WithoutLabel;
