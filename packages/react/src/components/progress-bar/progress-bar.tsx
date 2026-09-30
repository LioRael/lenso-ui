"use client";
// Derived from HeroUI v3.2.6 (Apache-2.0); modified for Base UI and StyleX.
import { Progress as Primitive } from "@base-ui/react/progress";
import { createContext, useContext, type ComponentProps } from "react";
import {
  progressBarStyles,
  progressBarColors,
  progressBarTrackSizes,
  progressBarFillSizes,
} from "@lenso/tokens/progress-bar";
import { styledPart, type StyleXProps } from "../../utils/styled.js";
const Context = createContext<{ size: keyof typeof progressBarTrackSizes; indeterminate: boolean }>(
  { size: "md", indeterminate: false },
);
const Root = styledPart(Primitive.Root, "progress-bar", progressBarStyles.root);
const Track = styledPart(Primitive.Track, "progress-bar-track", progressBarStyles.track);
const Fill = styledPart(Primitive.Indicator, "progress-bar-fill", progressBarStyles.fill);
export type ProgressBarRootProps = StyleXProps<ComponentProps<typeof Primitive.Root>> & {
  size?: keyof typeof progressBarTrackSizes;
  color?: keyof typeof progressBarColors;
};
export function ProgressBarRoot({
  size = "md",
  color = "accent",
  xstyle,
  ...props
}: ProgressBarRootProps) {
  return (
    <Context.Provider value={{ size, indeterminate: props.value === null }}>
      <Root {...props} xstyle={[progressBarColors[color], xstyle]} />
    </Context.Provider>
  );
}
export function ProgressBarTrack({ xstyle, ...props }: ComponentProps<typeof Track>) {
  const { size } = useContext(Context);
  return <Track {...props} xstyle={[progressBarTrackSizes[size], xstyle]} />;
}
export function ProgressBarFill({ xstyle, ...props }: ComponentProps<typeof Fill>) {
  const { size, indeterminate } = useContext(Context);
  return (
    <Fill
      {...props}
      xstyle={[
        progressBarFillSizes[size],
        indeterminate && progressBarStyles.indeterminate,
        xstyle,
      ]}
    />
  );
}
export const ProgressBarLabel = styledPart(Primitive.Label, "label", progressBarStyles.label);
export const ProgressBarOutput = styledPart(
  Primitive.Value,
  "progress-bar-output",
  progressBarStyles.output,
);
export const ProgressBar = Object.assign(ProgressBarRoot, {
  Root: ProgressBarRoot,
  Label: ProgressBarLabel,
  Output: ProgressBarOutput,
  Track: ProgressBarTrack,
  Fill: ProgressBarFill,
});
export type ProgressBarProps = ProgressBarRootProps;
export type ProgressBarLabelProps = ComponentProps<typeof ProgressBarLabel>;
export type ProgressBarOutputProps = ComponentProps<typeof ProgressBarOutput>;
export type ProgressBarTrackProps = ComponentProps<typeof ProgressBarTrack>;
export type ProgressBarFillProps = ComponentProps<typeof ProgressBarFill>;
export type ProgressBar = {
  Props: ProgressBarProps;
  RootProps: ProgressBarRootProps;
  LabelProps: ProgressBarLabelProps;
  OutputProps: ProgressBarOutputProps;
  TrackProps: ProgressBarTrackProps;
  FillProps: ProgressBarFillProps;
};
