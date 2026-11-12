"use client";
// Modified: UI SDK behavior and StyleX.
import * as Primitive from "@ui-sdk/react/progress";
import { slotRender } from "../../utils/sdk-render.js";
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
export type ProgressBarRootProps = StyleXProps<ComponentProps<typeof Primitive.Progress>> & {
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
    <Context.Provider value={{ size, indeterminate: props.value == null }}>
      <Primitive.Progress
        {...props}
        data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "progress-bar"}
        render={slotRender("div", props["data-slot"] ?? "progress-bar", props.render)}
        {...compiled}
        style={mergeStyle<Primitive.ProgressState>(compiled.style, style)}
      />
    </Context.Provider>
  );
}
export function ProgressBarTrack({
  xstyle,
  style,
  ...props
}: StyleXProps<ComponentProps<typeof Primitive.ProgressTrack>>) {
  const { size } = useContext(Context);
  const compiled = stylex.props(progressBarStyles.track, progressBarTrackSizes[size], xstyle);
  return (
    <Primitive.ProgressTrack
      {...props}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "progress-bar-track"}
      render={slotRender("div", props["data-slot"] ?? "progress-bar-track", props.render)}
      {...compiled}
      style={mergeStyle<Primitive.ProgressState>(compiled.style, style)}
    />
  );
}
export function ProgressBarFill({
  xstyle,
  style,
  ...props
}: StyleXProps<ComponentProps<typeof Primitive.ProgressIndicator>>) {
  const { size, indeterminate } = useContext(Context);
  const compiled = stylex.props(
    progressBarStyles.fill,
    progressBarFillSizes[size],
    indeterminate && progressBarStyles.indeterminate,
    xstyle,
  );
  return (
    <Primitive.ProgressIndicator
      {...props}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "progress-bar-fill"}
      render={slotRender("div", props["data-slot"] ?? "progress-bar-fill", props.render)}
      {...compiled}
      style={mergeStyle<Primitive.ProgressState>(compiled.style, style)}
    />
  );
}
export function ProgressBarLabel({
  xstyle,
  style,
  ...props
}: StyleXProps<ComponentProps<typeof Primitive.ProgressLabel>>) {
  const compiled = stylex.props(progressBarStyles.label, xstyle);
  return (
    <Primitive.ProgressLabel
      {...props}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "label"}
      render={slotRender("span", props["data-slot"] ?? "label", props.render)}
      {...compiled}
      style={mergeStyle<Primitive.ProgressState>(compiled.style, style)}
    />
  );
}
export function ProgressBarOutput({
  xstyle,
  style,
  ...props
}: StyleXProps<ComponentProps<typeof Primitive.ProgressValue>>) {
  const compiled = stylex.props(progressBarStyles.output, xstyle);
  return (
    <Primitive.ProgressValue
      {...props}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "progress-bar-output"}
      render={slotRender("span", props["data-slot"] ?? "progress-bar-output", props.render)}
      {...compiled}
      style={mergeStyle<Primitive.ProgressValueState>(compiled.style, style)}
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
