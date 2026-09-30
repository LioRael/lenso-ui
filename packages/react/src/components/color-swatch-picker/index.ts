/** HeroUI v3.2.6 derived work. Copyright NextUI Inc. Apache-2.0. Modified for Lenso StyleX. */
import type { ComponentProps } from "react";
import {
  ColorSwatchPickerRoot,
  ColorSwatchPickerItemPart as ColorSwatchPickerItem,
  ColorSwatchPickerSwatch,
  ColorSwatchPickerIndicator,
} from "./color-swatch-picker.js";
export {
  ColorSwatchPickerRoot,
  ColorSwatchPickerItem,
  ColorSwatchPickerSwatch,
  ColorSwatchPickerIndicator,
};
export type {
  ColorSwatchPickerRootProps,
  ColorSwatchPickerRootProps as ColorSwatchPickerProps,
  ColorSwatchPickerIndicatorProps,
} from "./color-swatch-picker.js";
export type ColorSwatchPickerItemProps = ComponentProps<typeof ColorSwatchPickerItem>;
export type ColorSwatchPickerSwatchProps = ComponentProps<typeof ColorSwatchPickerSwatch>;
export const ColorSwatchPicker = Object.assign(ColorSwatchPickerRoot, {
  Root: ColorSwatchPickerRoot,
  Item: ColorSwatchPickerItem,
  Swatch: ColorSwatchPickerSwatch,
  Indicator: ColorSwatchPickerIndicator,
});
