import ProgressCircleRoot from "./root.svelte";
import ProgressCircleTrack from "./track.svelte";
import ProgressCircleTrackCircle from "./track-circle.svelte";
import ProgressCircleFillCircle from "./fill-circle.svelte";
import ProgressCircleLabel from "./progress-circle-label.svelte";

export {
  ProgressCircleRoot,
  ProgressCircleTrack,
  ProgressCircleTrackCircle,
  ProgressCircleFillCircle,
  ProgressCircleLabel,
};
export const ProgressCircle: typeof ProgressCircleRoot & {
  Root: typeof ProgressCircleRoot;
  Label: typeof ProgressCircleLabel;
  Track: typeof ProgressCircleTrack;
  TrackCircle: typeof ProgressCircleTrackCircle;
  FillCircle: typeof ProgressCircleFillCircle;
} = Object.assign(ProgressCircleRoot, {
  Root: ProgressCircleRoot,
  Label: ProgressCircleLabel,
  Track: ProgressCircleTrack,
  TrackCircle: ProgressCircleTrackCircle,
  FillCircle: ProgressCircleFillCircle,
});
