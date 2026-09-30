/** HeroUI v3.2.6 derived work. Copyright NextUI Inc. Apache-2.0. Modified for Lenso StyleX. */
import type { ComponentProps } from "react";
import {
  ColorSliderRoot,
  ColorSliderLabel,
  ColorSliderOutput,
  ColorSliderTrack,
  ColorSliderThumb,
} from "./color-slider.js";
export { ColorSliderRoot, ColorSliderLabel, ColorSliderOutput, ColorSliderTrack, ColorSliderThumb };
export type {
  ColorSliderRootProps,
  ColorSliderRootProps as ColorSliderProps,
  HSLChannel,
  HSBChannel,
  RGBChannel,
  HSLHSBSharedChannel,
  AlphaChannel,
  ColorSliderChannelProps,
} from "./color-slider.js";
export type ColorSliderOutputProps = ComponentProps<typeof ColorSliderOutput>;
export type ColorSliderTrackProps = ComponentProps<typeof ColorSliderTrack>;
export type ColorSliderThumbProps = ComponentProps<typeof ColorSliderThumb>;
export const ColorSlider = Object.assign(ColorSliderRoot, {
  Root: ColorSliderRoot,
  Label: ColorSliderLabel,
  Output: ColorSliderOutput,
  Track: ColorSliderTrack,
  Thumb: ColorSliderThumb,
});
