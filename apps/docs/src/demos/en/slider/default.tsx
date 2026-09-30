"use client";
/** Adapted from HeroUI v3.2.6. SPDX-License-Identifier: Apache-2.0 */
import { Slider } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";

const styles = stylex.create({ slider: { width: "100%", maxWidth: 320 } });
export function Default() {
  return (
    <Slider xstyle={styles.slider} defaultValue={30}>
      <Slider.Label>Volume</Slider.Label>
      <Slider.Output />
      <Slider.Control>
        <Slider.Track>
          <Slider.Fill />
        </Slider.Track>
        <Slider.Thumb aria-label="Volume" />
      </Slider.Control>
    </Slider>
  );
}
