/** HeroUI v3.2.6 derived work. Copyright NextUI Inc. Apache-2.0. Modified for Lenso StyleX. */
import type { ComponentProps } from "react";
import {
  ColorPickerRoot,
  ColorPickerTrigger,
  ColorPickerPopover,
  ColorPickerDialog,
} from "./color-picker.js";
export { ColorPickerRoot, ColorPickerTrigger, ColorPickerPopover, ColorPickerDialog };
export type {
  ColorPickerRootProps,
  ColorPickerRootProps as ColorPickerProps,
} from "./color-picker.js";
export type ColorPickerTriggerProps = ComponentProps<typeof ColorPickerTrigger>;
export type ColorPickerPopoverProps = ComponentProps<typeof ColorPickerPopover>;
export const ColorPicker = Object.assign(ColorPickerRoot, {
  Root: ColorPickerRoot,
  Trigger: ColorPickerTrigger,
  Popover: ColorPickerPopover,
  Dialog: ColorPickerDialog,
});
