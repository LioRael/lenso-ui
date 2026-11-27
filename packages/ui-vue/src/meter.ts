import { meterStyles, meterColors, meterTrackSizes, meterFillSizes } from "@lenso/tokens/meter";
import {
  Meter as SdkRoot,
  MeterTrack as SdkTrack,
  MeterIndicator as SdkFill,
  MeterLabel as SdkLabel,
  MeterValue as SdkOutput,
} from "@ui-sdk/vue/meter";
import { sdkPart, type StyledPart } from "./parts.js";

export const MeterRoot: StyledPart<typeof SdkRoot, { color?: keyof typeof meterColors }> = sdkPart<
  typeof SdkRoot,
  { color?: keyof typeof meterColors }
>(SdkRoot, "meter", (props) => [meterStyles.root, meterColors[props.color ?? "default"]], "color");
export const MeterTrack: StyledPart<typeof SdkTrack, { size?: keyof typeof meterTrackSizes }> =
  sdkPart<typeof SdkTrack, { size?: keyof typeof meterTrackSizes }>(
    SdkTrack,
    "meter-track",
    (props) => [meterStyles.track, meterTrackSizes[props.size ?? "md"]],
    "size",
  );
export const MeterFill: StyledPart<typeof SdkFill, { size?: keyof typeof meterFillSizes }> =
  sdkPart<typeof SdkFill, { size?: keyof typeof meterFillSizes }>(
    SdkFill,
    "meter-fill",
    (props) => [meterStyles.fill, meterFillSizes[props.size ?? "md"]],
    "size",
  );
export const MeterLabel: StyledPart<typeof SdkLabel> = sdkPart(
  SdkLabel,
  "label",
  () => meterStyles.label,
);
export const MeterOutput: StyledPart<typeof SdkOutput> = sdkPart(
  SdkOutput,
  "meter-output",
  () => meterStyles.output,
);

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
