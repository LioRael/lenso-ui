import SliderRoot from "./slider-root.svelte";
import SliderControl from "./slider-control.svelte";
import SliderLabel from "./slider-label.svelte";
import SliderOutput from "./slider-output.svelte";
import SliderTrack from "./slider-track.svelte";
import SliderTrackPaint from "./slider-track-paint.svelte";
import SliderFill from "./slider-fill.svelte";
import SliderThumb from "./slider-thumb.svelte";
import SliderMarks from "./slider-marks.svelte";

export {
  SliderRoot,
  SliderControl,
  SliderLabel,
  SliderOutput,
  SliderTrack,
  SliderTrackPaint,
  SliderFill,
  SliderThumb,
  SliderMarks,
};
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
