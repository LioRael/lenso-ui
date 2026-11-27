import ColorSwatchPickerRoot from "./color-swatch-picker-root.svelte";
import ColorSwatchPickerItem from "./color-swatch-picker-item.svelte";
import ColorSwatchPickerSwatch from "./color-swatch-picker-swatch.svelte";
import ColorSwatchPickerIndicator from "./color-swatch-picker-indicator.svelte";

export {
  ColorSwatchPickerRoot,
  ColorSwatchPickerItem,
  ColorSwatchPickerSwatch,
  ColorSwatchPickerIndicator,
};
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
