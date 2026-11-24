import { colorAreaStyles } from "@lenso/tokens/color-area";
import { colorSliderStyles } from "@lenso/tokens/color-slider";
import { colorSwatchPickerStyles } from "@lenso/tokens/color-swatch-picker";
import { colorSwatchStyles } from "@lenso/tokens/color-swatch";
import { inputStyles } from "@lenso/tokens/input";
import { colorPickerStyles } from "@lenso/tokens/color-picker";
import {
  ColorPicker as SdkRoot,
  ColorPickerArea as SdkArea,
  ColorPickerAreaThumb as SdkAreaThumb,
  ColorPickerAreaCanvas as SdkAreaCanvas,
  ColorPickerSlider as SdkSlider,
  ColorPickerSliderThumb as SdkSliderThumb,
  ColorPickerInput as SdkInput,
  ColorPickerChannelInput as SdkChannelInput,
  ColorPickerSwatch as SdkSwatch,
  ColorPickerEyeDropper as SdkEyeDropper,
  ColorPickerSwatches as SdkSwatches,
  ColorPickerSwatchItem as SdkSwatchItem,
} from "@ui-sdk/solid/color-picker";
import { sdkPart, type StyledPart } from "./parts.js";

export const ColorPickerRoot: StyledPart<typeof SdkRoot> = sdkPart(
  SdkRoot,
  "color-picker",
  () => colorPickerStyles.root,
);
export const ColorPickerArea: StyledPart<typeof SdkArea> = sdkPart(
  SdkArea,
  "color-picker-area",
  () => colorAreaStyles.control,
);
export const ColorPickerAreaThumb: StyledPart<typeof SdkAreaThumb> = sdkPart(
  SdkAreaThumb,
  "color-picker-area-thumb",
  () => colorAreaStyles.thumb,
);
export const ColorPickerAreaCanvas: StyledPart<typeof SdkAreaCanvas> = sdkPart(
  SdkAreaCanvas,
  "color-picker-area-canvas",
  () => undefined,
);
export const ColorPickerSlider: StyledPart<typeof SdkSlider> = sdkPart(
  SdkSlider,
  "color-picker-slider",
  () => colorSliderStyles.track,
);
export const ColorPickerSliderThumb: StyledPart<typeof SdkSliderThumb> = sdkPart(
  SdkSliderThumb,
  "color-picker-slider-thumb",
  () => colorSliderStyles.thumb,
);
export const ColorPickerInput: StyledPart<typeof SdkInput> = sdkPart(
  SdkInput,
  "color-picker-input",
  () => inputStyles.input,
);
export const ColorPickerChannelInput: StyledPart<typeof SdkChannelInput> = sdkPart(
  SdkChannelInput,
  "color-picker-channel-input",
  () => inputStyles.input,
);
export const ColorPickerSwatch: StyledPart<typeof SdkSwatch> = sdkPart(
  SdkSwatch,
  "color-picker-swatch",
  () => colorSwatchStyles.root,
);
export const ColorPickerEyeDropper: StyledPart<typeof SdkEyeDropper> = sdkPart(
  SdkEyeDropper,
  "color-picker-eye-dropper",
  () => undefined,
);
export const ColorPickerSwatches: StyledPart<typeof SdkSwatches> = sdkPart(
  SdkSwatches,
  "color-picker-swatches",
  () => colorSwatchPickerStyles.root,
);
export const ColorPickerSwatchItem: StyledPart<typeof SdkSwatchItem> = sdkPart(
  SdkSwatchItem,
  "color-picker-swatch-item",
  () => colorSwatchPickerStyles.item,
);

export const ColorPicker: typeof ColorPickerRoot & {
  Root: typeof ColorPickerRoot;
  Area: typeof ColorPickerArea;
  AreaThumb: typeof ColorPickerAreaThumb;
  AreaCanvas: typeof ColorPickerAreaCanvas;
  Slider: typeof ColorPickerSlider;
  SliderThumb: typeof ColorPickerSliderThumb;
  Input: typeof ColorPickerInput;
  ChannelInput: typeof ColorPickerChannelInput;
  Swatch: typeof ColorPickerSwatch;
  EyeDropper: typeof ColorPickerEyeDropper;
  Swatches: typeof ColorPickerSwatches;
  SwatchItem: typeof ColorPickerSwatchItem;
} = Object.assign(ColorPickerRoot, {
  Root: ColorPickerRoot,
  Area: ColorPickerArea,
  AreaThumb: ColorPickerAreaThumb,
  AreaCanvas: ColorPickerAreaCanvas,
  Slider: ColorPickerSlider,
  SliderThumb: ColorPickerSliderThumb,
  Input: ColorPickerInput,
  ChannelInput: ColorPickerChannelInput,
  Swatch: ColorPickerSwatch,
  EyeDropper: ColorPickerEyeDropper,
  Swatches: ColorPickerSwatches,
  SwatchItem: ColorPickerSwatchItem,
});
