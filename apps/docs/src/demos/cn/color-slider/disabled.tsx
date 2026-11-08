"use client";

import { ColorSlider } from "@lenso/ui";
import { styles } from "../../en/color-picker/source.stylex";
export function Disabled() {
  return (
    <ColorSlider isDisabled channel="hue" xstyle={styles.xs} defaultValue="hsl(200, 100%, 50%)">
      <ColorSlider.Label>色相</ColorSlider.Label>
      <ColorSlider.Output />
      <ColorSlider.Track>
        <ColorSlider.Thumb />
      </ColorSlider.Track>
    </ColorSlider>
  );
}
