import { colorSliderStyles } from "@lenso/tokens/color-slider";
import {
  ColorPickerSlider as SdkRoot,
  ColorPickerSliderThumb as SdkThumb,
} from "@ui-sdk/solid/color-picker";
import { sdkPart, type StyledPart } from "./parts.js";

export const ColorSliderRoot: StyledPart<typeof SdkRoot> = sdkPart(
  SdkRoot,
  "color-slider",
  (props) => [
    colorSliderStyles.root,
    colorSliderStyles.track,
    props.orientation === "vertical" && colorSliderStyles.verticalTrack,
  ],
);
export const ColorSliderThumb: StyledPart<typeof SdkThumb> = sdkPart(
  SdkThumb,
  "color-slider-thumb",
  () => colorSliderStyles.thumb,
);

export const ColorSlider: typeof ColorSliderRoot & {
  Root: typeof ColorSliderRoot;
  Thumb: typeof ColorSliderThumb;
} = Object.assign(ColorSliderRoot, {
  Root: ColorSliderRoot,
  Thumb: ColorSliderThumb,
});
