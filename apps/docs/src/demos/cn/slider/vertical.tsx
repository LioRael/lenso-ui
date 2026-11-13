"use client";

import { Slider } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  wrapper: {
    display: "flex",
    height: "16rem",
    alignItems: "center",
    justifyContent: "center",
  },
  root: {
    height: "100%",
  },
});
export function Vertical() {
  return (
    <div {...stylex.props(styles.wrapper)}>
      <Slider xstyle={styles.root} defaultValue={30} orientation="vertical">
        <Slider.Label>音量</Slider.Label>
        <Slider.Output />
        <Slider.Control>
          <Slider.Track>
            <Slider.Fill />
            <Slider.Thumb />
          </Slider.Track>
        </Slider.Control>
      </Slider>
    </div>
  );
}
