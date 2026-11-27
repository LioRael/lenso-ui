import MeterRoot from "./meter-root.svelte";
import MeterTrack from "./meter-track.svelte";
import MeterFill from "./meter-fill.svelte";
import MeterLabel from "./meter-label.svelte";
import MeterOutput from "./meter-output.svelte";

export { MeterRoot, MeterTrack, MeterFill, MeterLabel, MeterOutput };
export const Meter: typeof MeterRoot & {
  Root: typeof MeterRoot;
  Track: typeof MeterTrack;
  Fill: typeof MeterFill;
  Label: typeof MeterLabel;
  Output: typeof MeterOutput;
} = Object.assign(MeterRoot, {
  Root: MeterRoot,
  Track: MeterTrack,
  Fill: MeterFill,
  Label: MeterLabel,
  Output: MeterOutput,
});
