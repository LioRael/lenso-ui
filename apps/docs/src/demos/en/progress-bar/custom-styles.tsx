"use client";
// Adapted from HeroUI v3.2.6 (Apache-2.0).
import { ProgressBar } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  progress: { width: 256 },
  label: { fontWeight: 500, color: "var(--foreground)" },
  output: {
    fontSize: 12,
    lineHeight: "16px",
    color: "var(--muted)",
    fontVariantNumeric: "tabular-nums",
  },
  track: { borderRadius: 9999, backgroundColor: "var(--default)" },
  fill: { borderRadius: 9999, backgroundColor: "var(--accent)" },
});
export function CustomStyles() {
  return (
    <ProgressBar aria-label="Upload progress" xstyle={styles.progress} value={45}>
      <ProgressBar.Label xstyle={styles.label}>Uploading resume.pdf</ProgressBar.Label>
      <ProgressBar.Output xstyle={styles.output} />
      <ProgressBar.Track xstyle={styles.track}>
        <ProgressBar.Fill xstyle={styles.fill} />
      </ProgressBar.Track>
    </ProgressBar>
  );
}
export default CustomStyles;
