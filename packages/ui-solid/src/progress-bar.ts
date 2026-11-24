import {
  progressBarStyles,
  progressBarColors,
  progressBarTrackSizes,
  progressBarFillSizes,
} from "@lenso/tokens/progress-bar";
import {
  Progress as SdkRoot,
  ProgressTrack as SdkTrack,
  ProgressIndicator as SdkFill,
  ProgressLabel as SdkLabel,
  ProgressValue as SdkOutput,
} from "@ui-sdk/solid/progress";
import { type ComponentProps } from "solid-js";
import { sdkPart, type StyledPart } from "./parts.js";

export const ProgressBarRoot: StyledPart<
  typeof SdkRoot,
  { color?: keyof typeof progressBarColors }
> = sdkPart<ComponentProps<typeof SdkRoot>, { color?: keyof typeof progressBarColors }>(
  SdkRoot,
  "progress-bar",
  (props) => [progressBarStyles.root, progressBarColors[props.color ?? "default"]],
  "color",
);
export const ProgressBarTrack: StyledPart<
  typeof SdkTrack,
  { size?: keyof typeof progressBarTrackSizes }
> = sdkPart<ComponentProps<typeof SdkTrack>, { size?: keyof typeof progressBarTrackSizes }>(
  SdkTrack,
  "progress-bar-track",
  (props) => [progressBarStyles.track, progressBarTrackSizes[props.size ?? "md"]],
  "size",
);
export const ProgressBarFill: StyledPart<
  typeof SdkFill,
  { size?: keyof typeof progressBarFillSizes }
> = sdkPart<ComponentProps<typeof SdkFill>, { size?: keyof typeof progressBarFillSizes }>(
  SdkFill,
  "progress-bar-fill",
  (props) => [progressBarStyles.fill, progressBarFillSizes[props.size ?? "md"]],
  "size",
);
export const ProgressBarLabel: StyledPart<typeof SdkLabel> = sdkPart(
  SdkLabel,
  "label",
  () => progressBarStyles.label,
);
export const ProgressBarOutput: StyledPart<typeof SdkOutput> = sdkPart(
  SdkOutput,
  "progress-bar-output",
  () => progressBarStyles.output,
);

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
