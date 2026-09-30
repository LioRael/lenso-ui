"use client";
/** Adapted from HeroUI v3.2.6. SPDX-License-Identifier: Apache-2.0 */
import { Slider } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  wrapper: { display: "flex", height: "16rem", alignItems: "center", justifyContent: "center" },
  root: { height: "100%" },
});
export function Vertical() {
  return (
    <div {...stylex.props(styles.wrapper)}>
      <Slider xstyle={styles.root} defaultValue={30} orientation="vertical">
        <Slider.Label>Volume</Slider.Label>
        <Slider.Output />
        <Slider.Control>
          <Slider.Track>
            <Slider.Fill />
          </Slider.Track>
          <Slider.Thumb />
        </Slider.Control>
      </Slider>
    </div>
  );
}
