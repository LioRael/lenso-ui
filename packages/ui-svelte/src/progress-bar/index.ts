import ProgressBarRoot from "./progress-bar-root.svelte";
import ProgressBarTrack from "./progress-bar-track.svelte";
import ProgressBarFill from "./progress-bar-fill.svelte";
import ProgressBarLabel from "./progress-bar-label.svelte";
import ProgressBarOutput from "./progress-bar-output.svelte";

export { ProgressBarRoot, ProgressBarTrack, ProgressBarFill, ProgressBarLabel, ProgressBarOutput };
export const ProgressBar: typeof ProgressBarRoot & {
  Root: typeof ProgressBarRoot;
  Track: typeof ProgressBarTrack;
  Fill: typeof ProgressBarFill;
  Label: typeof ProgressBarLabel;
  Output: typeof ProgressBarOutput;
} = Object.assign(ProgressBarRoot, {
  Root: ProgressBarRoot,
  Track: ProgressBarTrack,
  Fill: ProgressBarFill,
  Label: ProgressBarLabel,
  Output: ProgressBarOutput,
});
