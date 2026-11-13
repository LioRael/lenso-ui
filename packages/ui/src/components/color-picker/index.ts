// Copyright NextUI Inc. Apache-2.0. Modified for Lenso StyleX.
import type { ComponentProps } from "react";
import {
  PopoverTitle as ColorPickerTitle,
  PopoverClose as ColorPickerClose,
  PopoverDescription as ColorPickerPopoverDescription,
} from "../popover/index.js";
import { ColorPickerRoot, ColorPickerTrigger, ColorPickerPopover } from "./color-picker.js";
export { ColorPickerRoot, ColorPickerTrigger, ColorPickerPopover };
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
  Title: ColorPickerTitle,
  Close: ColorPickerClose,
  PopoverDescription: ColorPickerPopoverDescription,
});

export { ColorPickerClose, ColorPickerTitle, ColorPickerPopoverDescription };
