// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

/** Adapted from HeroUI v3.2.6. SPDX-License-Identifier: Apache-2.0 */
import { Slider } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  root: {
    width: "100%",
    maxWidth: "20rem",
  },
  label: {
    fontWeight: 500,
    color: "var(--foreground)",
  },
  output: {
    fontSize: ".75rem",
    color: "var(--muted)",
    fontVariantNumeric: "tabular-nums",
  },
  track: {
    backgroundColor: "var(--default)",
  },
  fill: {
    backgroundColor: "var(--accent)",
  },
  thumb: {
    backgroundColor: "var(--accent)",
    "::after": {
      backgroundColor: "var(--accent-foreground)",
    },
  },
});
export function CustomStyles() {
  return (
    <Slider xstyle={styles.root} defaultValue={40}>
      <Slider.Label xstyle={styles.label}>亮度</Slider.Label>
      <Slider.Output xstyle={styles.output} />
      <Slider.Control>
        <Slider.Track xstyle={styles.track}>
          <Slider.Fill xstyle={styles.fill} />
        </Slider.Track>
        <Slider.Thumb xstyle={styles.thumb} />
      </Slider.Control>
    </Slider>
  );
}
