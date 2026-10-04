// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

/** Adapted from HeroUI v3.2.6. SPDX-License-Identifier: Apache-2.0 */
import { Slider } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  slider: {
    width: "100%",
    maxWidth: 320,
  },
});
export function Default() {
  return (
    <Slider xstyle={styles.slider} defaultValue={30}>
      <Slider.Label>音量</Slider.Label>
      <Slider.Output />
      <Slider.Control>
        <Slider.Track>
          <Slider.Fill />
        </Slider.Track>
        <Slider.Thumb aria-label="音量" />
      </Slider.Control>
    </Slider>
  );
}
