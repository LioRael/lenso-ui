"use client";
/** Adapted from HeroUI v3.2.6. Apache-2.0. Native RAC render state replaces DOM render interception. */
import { ColorSlider } from "@lenso/ui";
import { styles } from "../color-picker/source.stylex";
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
          <ColorSlider.Label>Hue</ColorSlider.Label>
          <ColorSlider.Output />
          <ColorSlider.Track>
            <ColorSlider.Thumb data-disabled={isDisabled || undefined} />
          </ColorSlider.Track>
        </>
      )}
    </ColorSlider>
  );
}
