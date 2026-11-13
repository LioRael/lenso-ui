"use client";

import { ColorSlider } from "@lenso/ui";
import { styles } from "../../en/color-picker/source.stylex";
export function RenderFunction() {
  return (
    <ColorSlider
      channel="hue"
      xstyle={styles.xs}
      defaultValue="hsl(0, 100%, 50%)"
      data-custom="foo"
      render={(props, state) => <div {...props} data-disabled={state.disabled || undefined} />}
    >
      <>
        <ColorSlider.Label>色相</ColorSlider.Label>
        <ColorSlider.Output />
        <ColorSlider.Track>
          <ColorSlider.Thumb />
        </ColorSlider.Track>
      </>
    </ColorSlider>
  );
}
