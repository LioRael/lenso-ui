import { Popover } from "../popover/index.js";
import ColorPickerRoot from "./color-picker-root.svelte";
import ColorPickerArea from "./color-picker-area.svelte";
import ColorPickerAreaThumb from "./color-picker-area-thumb.svelte";
import ColorPickerAreaCanvas from "./color-picker-area-canvas.svelte";
import ColorPickerSlider from "./color-picker-slider.svelte";
import ColorPickerSliderThumb from "./color-picker-slider-thumb.svelte";
import ColorPickerInput from "./color-picker-input.svelte";
import ColorPickerChannelInput from "./color-picker-channel-input.svelte";
import ColorPickerSwatch from "./color-picker-swatch.svelte";
import ColorPickerEyeDropper from "./color-picker-eye-dropper.svelte";
import ColorPickerSwatches from "./color-picker-swatches.svelte";
import ColorPickerSwatchItem from "./color-picker-swatch-item.svelte";

export {
  ColorPickerRoot,
  ColorPickerArea,
  ColorPickerAreaThumb,
  ColorPickerAreaCanvas,
  ColorPickerSlider,
  ColorPickerSliderThumb,
  ColorPickerInput,
  ColorPickerChannelInput,
  ColorPickerSwatch,
  ColorPickerEyeDropper,
  ColorPickerSwatches,
  ColorPickerSwatchItem,
};
export const ColorPicker: typeof ColorPickerRoot & {
  Trigger: typeof Popover.Trigger;
  Popover: typeof Popover.Content;
  Title: typeof Popover.Title;
  Close: typeof Popover.Close;
  PopoverDescription: typeof Popover.Description;
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
  Trigger: Popover.Trigger,
  Popover: Popover.Content,
  Title: Popover.Title,
  Close: Popover.Close,
  PopoverDescription: Popover.Description,
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

export const ColorPickerClose: typeof ColorPicker.Close = ColorPicker.Close;

export const ColorPickerPopover: typeof ColorPicker.Popover = ColorPicker.Popover;

export const ColorPickerPopoverDescription: typeof ColorPicker.PopoverDescription =
  ColorPicker.PopoverDescription;

export const ColorPickerTitle: typeof ColorPicker.Title = ColorPicker.Title;

export const ColorPickerTrigger: typeof ColorPicker.Trigger = ColorPicker.Trigger;
