// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 (Apache-2.0).
import { Meter } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  meter: {
    width: 256,
  },
  label: {
    fontWeight: 500,
    color: "var(--foreground)",
  },
  output: {
    color: "var(--muted)",
    fontVariantNumeric: "tabular-nums",
  },
  track: {
    borderRadius: 9999,
    backgroundColor: "var(--default)",
  },
  fill: {
    borderRadius: 9999,
    backgroundColor: "var(--warning)",
  },
});
export function CustomStyles() {
  return (
    <Meter aria-label="已用存储空间" xstyle={styles.meter} value={68}>
      <Meter.Label xstyle={styles.label}>已用存储空间</Meter.Label>
      <Meter.Output xstyle={styles.output} />
      <Meter.Track xstyle={styles.track}>
        <Meter.Fill xstyle={styles.fill} />
      </Meter.Track>
    </Meter>
  );
}
export default CustomStyles;
