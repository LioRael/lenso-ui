// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 (Apache-2.0).
import { ProgressBar } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  progress: {
    width: 256,
  },
  label: {
    fontWeight: 500,
    color: "var(--foreground)",
  },
  output: {
    fontSize: 12,
    lineHeight: "16px",
    color: "var(--muted)",
    fontVariantNumeric: "tabular-nums",
  },
  track: {
    borderRadius: 9999,
    backgroundColor: "var(--default)",
  },
  fill: {
    borderRadius: 9999,
    backgroundColor: "var(--accent)",
  },
});
export function CustomStyles() {
  return (
    <ProgressBar aria-label="上传进度" xstyle={styles.progress} value={45}>
      <ProgressBar.Label xstyle={styles.label}>正在上传 resume.pdf</ProgressBar.Label>
      <ProgressBar.Output xstyle={styles.output} />
      <ProgressBar.Track xstyle={styles.track}>
        <ProgressBar.Fill xstyle={styles.fill} />
      </ProgressBar.Track>
    </ProgressBar>
  );
}
export default CustomStyles;
