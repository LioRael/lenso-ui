"use client";
// Adapted from HeroUI v3.2.6 (Apache-2.0).
import { Meter } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  meter: { width: 256 },
  label: { fontWeight: 500, color: "var(--foreground)" },
  output: { color: "var(--muted)", fontVariantNumeric: "tabular-nums" },
  track: { borderRadius: 9999, backgroundColor: "var(--default)" },
  fill: { borderRadius: 9999, backgroundColor: "var(--warning)" },
});
export function CustomStyles() {
  return (
    <Meter aria-label="Storage used" xstyle={styles.meter} value={68}>
      <Meter.Label xstyle={styles.label}>Storage used</Meter.Label>
      <Meter.Output xstyle={styles.output} />
      <Meter.Track xstyle={styles.track}>
        <Meter.Fill xstyle={styles.fill} />
      </Meter.Track>
    </Meter>
  );
}
export default CustomStyles;
