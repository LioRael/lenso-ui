import ColorSliderOutput from "./color-slider-output.svelte";
export { ColorSliderOutput };
import ColorSliderTrack from "./color-slider-track.svelte";
export { ColorSliderTrack };
import ColorSliderLabel from "./color-slider-label.svelte";
export { ColorSliderLabel };
import ColorSliderRoot from "./color-slider-root.svelte";
import ColorSliderThumb from "./color-slider-thumb.svelte";

export { ColorSliderRoot, ColorSliderThumb };
export const ColorSlider: typeof ColorSliderRoot & {
  Label: typeof ColorSliderLabel;
  Track: typeof ColorSliderTrack;
  Output: typeof ColorSliderOutput;
  Root: typeof ColorSliderRoot;
  Thumb: typeof ColorSliderThumb;
} = Object.assign(ColorSliderRoot, {
  Label: ColorSliderLabel,
  Track: ColorSliderTrack,
  Output: ColorSliderOutput,
  Root: ColorSliderRoot,
  Thumb: ColorSliderThumb,
});
