import { colorSwatchPickerStyles } from "@lenso/tokens/color-swatch-picker";
import {
  ColorPickerSwatches as SdkRoot,
  ColorPickerSwatchItem as SdkItem,
} from "@ui-sdk/solid/color-picker";
import { htmlPart, sdkPart, type StyledPart } from "./parts.js";

export const ColorSwatchPickerRoot: StyledPart<typeof SdkRoot> = sdkPart(
  SdkRoot,
  "color-swatch-picker",
  () => colorSwatchPickerStyles.root,
);
export const ColorSwatchPickerItem: StyledPart<typeof SdkItem> = sdkPart(
  SdkItem,
  "color-swatch-picker-item",
  () => colorSwatchPickerStyles.item,
);
export const ColorSwatchPickerSwatch = htmlPart(
  "span",
  "color-swatch-picker-swatch",
  () => colorSwatchPickerStyles.swatch,
);
export const ColorSwatchPickerIndicator = htmlPart(
  "span",
  "color-swatch-picker-indicator",
  () => colorSwatchPickerStyles.indicator,
);

export const ColorSwatchPicker: typeof ColorSwatchPickerRoot & {
  Root: typeof ColorSwatchPickerRoot;
  Item: typeof ColorSwatchPickerItem;
  Swatch: typeof ColorSwatchPickerSwatch;
  Indicator: typeof ColorSwatchPickerIndicator;
} = Object.assign(ColorSwatchPickerRoot, {
  Root: ColorSwatchPickerRoot,
  Item: ColorSwatchPickerItem,
  Swatch: ColorSwatchPickerSwatch,
  Indicator: ColorSwatchPickerIndicator,
});
