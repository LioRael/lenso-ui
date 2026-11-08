"use client";

// Native RAC render state replaces DOM render interception.
import { ColorSlider } from "@lenso/ui";
import { styles } from "../../en/color-picker/source.stylex";
export function RenderFunction() {
  return (
    <ColorSlider
      channel="hue"
      xstyle={styles.xs}
      defaultValue="hsl(0, 100%, 50%)"
      data-custom="foo"
    >
      {({ isDisabled }) => (
        <>
          <ColorSlider.Label>色相</ColorSlider.Label>
          <ColorSlider.Output />
          <ColorSlider.Track>
            <ColorSlider.Thumb data-disabled={isDisabled || undefined} />
          </ColorSlider.Track>
        </>
      )}
    </ColorSlider>
  );
}
