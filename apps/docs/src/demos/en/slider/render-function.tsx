"use client";
/** Adapted from HeroUI v3.2.6. SPDX-License-Identifier: Apache-2.0 */
import { Slider } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({ root: { width: "100%", maxWidth: "20rem" } });
export function RenderFunction() {
  return (
    <Slider
      xstyle={styles.root}
      defaultValue={30}
      render={(props) => <div {...props} data-custom="foo" />}
    >
      <Slider.Label>Volume</Slider.Label>
      <Slider.Output />
      <Slider.Control>
        <Slider.Track>
          <Slider.Fill />
        </Slider.Track>
        <Slider.Thumb />
      </Slider.Control>
    </Slider>
  );
}
