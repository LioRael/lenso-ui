"use client";

import { Slider } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  root: {
    width: "100%",
    maxWidth: "20rem",
  },
});
export function Disabled() {
  return (
    <Slider disabled xstyle={styles.root} defaultValue={30}>
      <Slider.Label>音量</Slider.Label>
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
