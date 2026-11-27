import { colorAreaStyles } from "@lenso/tokens/color-area";
import {
  ColorPickerArea as SdkRoot,
  ColorPickerAreaThumb as SdkThumb,
  ColorPickerAreaCanvas as SdkCanvas,
} from "@ui-sdk/vue/color-picker";
import { sdkPart, type StyledPart } from "./parts.js";

export const ColorAreaRoot: StyledPart<typeof SdkRoot> = sdkPart(SdkRoot, "color-area", () => [
  colorAreaStyles.root,
  colorAreaStyles.control,
]);
export const ColorAreaThumb: StyledPart<typeof SdkThumb> = sdkPart(
  SdkThumb,
  "color-area-thumb",
  () => colorAreaStyles.thumb,
);
export const ColorAreaCanvas: StyledPart<typeof SdkCanvas> = sdkPart(
  SdkCanvas,
  "color-area-canvas",
  () => undefined,
);

export const ColorArea: typeof ColorAreaRoot & {
  Root: typeof ColorAreaRoot;
  Thumb: typeof ColorAreaThumb;
  Canvas: typeof ColorAreaCanvas;
} = Object.assign(ColorAreaRoot, {
  Root: ColorAreaRoot,
  Thumb: ColorAreaThumb,
  Canvas: ColorAreaCanvas,
});
