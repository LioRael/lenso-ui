import {
  SliderRoot,
  SliderLabel,
  SliderOutput,
  SliderControl,
  SliderTrack,
  SliderFill,
  SliderThumb,
  SliderMarks,
} from "./slider.js";
export const Slider = Object.assign(SliderRoot, {
  Root: SliderRoot,
  Label: SliderLabel,
  Output: SliderOutput,
  Value: SliderOutput,
  Control: SliderControl,
  Track: SliderTrack,
  Fill: SliderFill,
  Indicator: SliderFill,
  Thumb: SliderThumb,
  Marks: SliderMarks,
});
export * from "./slider.js";
