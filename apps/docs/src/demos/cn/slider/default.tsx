"use client";

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
          <Slider.Thumb aria-label="音量" />
        </Slider.Track>
      </Slider.Control>
    </Slider>
  );
}
