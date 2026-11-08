"use client";
import { ColorSlider } from "@lenso/ui";
import { styles } from "../color-picker/source.stylex";
export function Disabled() {
  return (
    <ColorSlider isDisabled channel="hue" xstyle={styles.xs} defaultValue="hsl(200, 100%, 50%)">
      <ColorSlider.Label>Hue</ColorSlider.Label>
      <ColorSlider.Output />
      <ColorSlider.Track>
        <ColorSlider.Thumb />
      </ColorSlider.Track>
    </ColorSlider>
  );
}
