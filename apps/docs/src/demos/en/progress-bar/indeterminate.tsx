"use client";
// Adapted from HeroUI v3.2.6 (Apache-2.0); null is Base UI's indeterminate value.
import { ProgressBar } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({ progress: { width: 256 } });
export function Indeterminate() {
  return (
    <ProgressBar aria-label="Loading" xstyle={styles.progress} value={null}>
      <ProgressBar.Label>Loading...</ProgressBar.Label>
      <ProgressBar.Track>
        <ProgressBar.Fill />
      </ProgressBar.Track>
    </ProgressBar>
  );
}
export default Indeterminate;
