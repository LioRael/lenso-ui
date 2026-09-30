// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

import { ColorSlider } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  slider: {
    width: "100%",
    maxWidth: 320,
  },
});
export function Basic() {
  return (
    <ColorSlider
      aria-label="色相"
      channel="hue"
      xstyle={styles.slider}
      defaultValue="hsl(0, 100%, 50%)"
    >
      <span>色相</span>
      <ColorSlider.Output />
      <ColorSlider.Track>
        <ColorSlider.Thumb />
      </ColorSlider.Track>
    </ColorSlider>
  );
}
