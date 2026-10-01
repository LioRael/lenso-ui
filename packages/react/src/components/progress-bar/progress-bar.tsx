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
import * as stylex from "@stylexjs/stylex";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";
const Context = createContext<{ size: keyof typeof progressBarTrackSizes; indeterminate: boolean }>(
  { size: "md", indeterminate: false },
);
export type ProgressBarRootProps = StyleXProps<Primitive.Root.Props> & {
  size?: keyof typeof progressBarTrackSizes;
  color?: keyof typeof progressBarColors;
};
export function ProgressBarRoot({
  size = "md",
  color = "accent",
  xstyle,
  style,
  ...props
}: ProgressBarRootProps) {
  const compiled = stylex.props(progressBarStyles.root, progressBarColors[color], xstyle);
  return (
    <Context.Provider value={{ size, indeterminate: props.value === null }}>
      <Primitive.Root
        {...props}
        data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "progress-bar"}
        {...compiled}
        style={mergeStyle<Primitive.Root.State>(compiled.style, style)}
      />
    </Context.Provider>
  );
}
export function ProgressBarTrack({ xstyle, style, ...props }: StyleXProps<Primitive.Track.Props>) {
  const { size } = useContext(Context);
  const compiled = stylex.props(progressBarStyles.track, progressBarTrackSizes[size], xstyle);
  return (
    <Primitive.Track
      {...props}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "progress-bar-track"}
      {...compiled}
      style={mergeStyle<Primitive.Track.State>(compiled.style, style)}
    />
  );
}
export function ProgressBarFill({
  xstyle,
  style,
  ...props
}: StyleXProps<Primitive.Indicator.Props>) {
  const { size, indeterminate } = useContext(Context);
  const compiled = stylex.props(
    progressBarStyles.fill,
    progressBarFillSizes[size],
    indeterminate && progressBarStyles.indeterminate,
    xstyle,
  );
  return (
    <Primitive.Indicator
      {...props}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "progress-bar-fill"}
      {...compiled}
      style={mergeStyle<Primitive.Indicator.State>(compiled.style, style)}
    />
  );
}
export function ProgressBarLabel({ xstyle, style, ...props }: StyleXProps<Primitive.Label.Props>) {
  const compiled = stylex.props(progressBarStyles.label, xstyle);
  return (
    <Primitive.Label
      {...props}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "label"}
      {...compiled}
      style={mergeStyle<Primitive.Label.State>(compiled.style, style)}
    />
  );
}
export function ProgressBarOutput({ xstyle, style, ...props }: StyleXProps<Primitive.Value.Props>) {
  const compiled = stylex.props(progressBarStyles.output, xstyle);
  return (
    <Primitive.Value
      {...props}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "progress-bar-output"}
      {...compiled}
      style={mergeStyle<Primitive.Value.State>(compiled.style, style)}
    />
  );
}
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
