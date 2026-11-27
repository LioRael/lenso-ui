import { sliderStyles } from "@lenso/tokens/slider";
import {
  Slider as SdkRoot,
  SliderControl as SdkControl,
  SliderValue as SdkOutput,
  SliderTrack as SdkTrack,
  SliderIndicator as SdkFill,
  SliderThumb as SdkThumb,
} from "@ui-sdk/solid/slider";
import { FieldLabel as SdkLabel } from "@ui-sdk/solid/field";
import { htmlPart, sdkPart, type SlotProps, type StyledPart } from "./parts.js";

export function SliderRoot<Value extends number | number[] = number | number[]>(
  props: Parameters<typeof SdkRoot<Value>>[0] & SlotProps,
) {
  return sdkPart(SdkRoot<Value>, "slider", () => sliderStyles.root)(props);
}
export const SliderControl: StyledPart<typeof SdkControl> = sdkPart(
  SdkControl,
  "slider-control",
  () => sliderStyles.control,
);
export const SliderLabel: StyledPart<typeof SdkLabel> = sdkPart(
  SdkLabel,
  "label",
  () => sliderStyles.label,
);
export const SliderOutput: StyledPart<typeof SdkOutput> = sdkPart(
  SdkOutput,
  "slider-output",
  () => sliderStyles.output,
);
export const SliderTrack: StyledPart<typeof SdkTrack> = sdkPart(
  SdkTrack,
  "slider-track",
  () => sliderStyles.track,
);
export const SliderTrackPaint = htmlPart(
  "span",
  "slider-track-paint",
  () => sliderStyles.trackPaint,
);
export const SliderFill: StyledPart<typeof SdkFill> = sdkPart(
  SdkFill,
  "slider-fill",
  () => sliderStyles.fill,
);
export const SliderThumb: StyledPart<typeof SdkThumb> = sdkPart(
  SdkThumb,
  "slider-thumb",
  () => sliderStyles.thumb,
);
export const SliderMarks = htmlPart("div", "slider-marks", () => sliderStyles.marks);

export const Slider: typeof SliderRoot & {
  Value: typeof SliderOutput;
  Indicator: typeof SliderFill;
  Root: typeof SliderRoot;
  Control: typeof SliderControl;
  Label: typeof SliderLabel;
  Output: typeof SliderOutput;
  Track: typeof SliderTrack;
  TrackPaint: typeof SliderTrackPaint;
  Fill: typeof SliderFill;
  Thumb: typeof SliderThumb;
  Marks: typeof SliderMarks;
} = Object.assign(SliderRoot, {
  Value: SliderOutput,
  Indicator: SliderFill,
  Root: SliderRoot,
  Control: SliderControl,
  Label: SliderLabel,
  Output: SliderOutput,
  Track: SliderTrack,
  TrackPaint: SliderTrackPaint,
  Fill: SliderFill,
  Thumb: SliderThumb,
  Marks: SliderMarks,
});
