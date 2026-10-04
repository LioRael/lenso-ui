// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 (Apache-2.0); null is Base UI's indeterminate value.
import { ProgressBar } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  progress: {
    width: 256,
  },
});
export function Indeterminate() {
  return (
    <ProgressBar aria-label="加载中" xstyle={styles.progress} value={null}>
      <ProgressBar.Label>加载中…</ProgressBar.Label>
      <ProgressBar.Track>
        <ProgressBar.Fill />
      </ProgressBar.Track>
    </ProgressBar>
  );
}
export default Indeterminate;
