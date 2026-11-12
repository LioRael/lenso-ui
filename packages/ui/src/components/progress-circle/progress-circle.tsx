"use client";
// Modified: UI SDK behavior, native SVG and StyleX.
import * as Primitive from "@ui-sdk/react/progress";
import { slotRender } from "../../utils/sdk-render.js";
import { createContext, useContext, type ComponentProps } from "react";
import {
  progressCircleStyles,
  progressCircleSizes,
  progressCircleColors,
} from "@lenso/tokens/progress-circle";
import * as stylex from "@stylexjs/stylex";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";
const CENTER = 18;
const RADIUS = 16;
const Context = createContext({
  size: "md" as keyof typeof progressCircleSizes,
  percentage: 0,
  indeterminate: false,
});
export type ProgressCircleRootProps = StyleXProps<ComponentProps<typeof Primitive.Progress>> & {
  size?: keyof typeof progressCircleSizes;
  color?: keyof typeof progressCircleColors;
};
export function ProgressCircleRoot({
  size = "md",
  color = "accent",
  xstyle,
  style,
  ...props
}: ProgressCircleRootProps) {
  const min = props.min ?? 0;
  const max = props.max ?? 100;
  const percentage =
    max > min ? Math.max(0, Math.min(100, (((props.value ?? min) - min) / (max - min)) * 100)) : 0;
  const compiled = stylex.props(progressCircleStyles.root, progressCircleColors[color], xstyle);
  return (
    <Context.Provider value={{ size, percentage, indeterminate: props.value == null }}>
      <Primitive.Progress
        {...props}
        data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "progress-circle"}
        render={slotRender("div", props["data-slot"] ?? "progress-circle", props.render)}
        {...compiled}
        style={mergeStyle<Primitive.ProgressState>(compiled.style, style)}
      />
    </Context.Provider>
  );
}
export function ProgressCircleTrack({
  xstyle,
  style,
  ...props
}: StyleXProps<ComponentProps<"svg">>) {
  const { size, indeterminate } = useContext(Context);
  const compiled = stylex.props(
    progressCircleStyles.track,
    progressCircleSizes[size],
    indeterminate && progressCircleStyles.indeterminate,
    xstyle,
  );
  return (
    <svg
      viewBox="0 0 36 36"
      fill="none"
      aria-hidden="true"
      {...props}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "progress-circle-track"}
      {...compiled}
      style={{ ...compiled.style, ...style }}
    />
  );
}
export function ProgressCircleTrackCircle({
  xstyle,
  style,
  ...props
}: StyleXProps<ComponentProps<"circle">>) {
  const compiled = stylex.props(progressCircleStyles.trackCircle, xstyle);
  return (
    <circle
      cx={CENTER}
      cy={CENTER}
      r={RADIUS}
      strokeWidth={4}
      {...props}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "progress-circle-track-circle"}
      {...compiled}
      style={{ ...compiled.style, ...style }}
    />
  );
}
export function ProgressCircleFillCircle({
  xstyle,
  style,
  ...props
}: StyleXProps<ComponentProps<"circle">>) {
  const { percentage, indeterminate } = useContext(Context);
  const radius = Number(props.r ?? RADIUS);
  const circumference = 2 * Math.PI * radius;
  const cx = props.cx ?? CENTER;
  const cy = props.cy ?? CENTER;
  const compiled = stylex.props(progressCircleStyles.fillCircle, xstyle);
  return (
    <circle
      cx={CENTER}
      cy={CENTER}
      r={RADIUS}
      strokeWidth={4}
      strokeDasharray={circumference}
      strokeDashoffset={circumference * (indeterminate ? 0.75 : 1 - percentage / 100)}
      strokeLinecap="round"
      transform={`rotate(-90 ${cx} ${cy})`}
      {...props}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "progress-circle-fill-circle"}
      {...compiled}
      style={{ ...compiled.style, ...style }}
    />
  );
}
export function ProgressCircleLabel({
  xstyle,
  style,
  ...props
}: StyleXProps<ComponentProps<typeof Primitive.ProgressLabel>>) {
  const compiled = stylex.props(xstyle);
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
export const ProgressCircle = Object.assign(ProgressCircleRoot, {
  Root: ProgressCircleRoot,
  Label: ProgressCircleLabel,
  Track: ProgressCircleTrack,
  TrackCircle: ProgressCircleTrackCircle,
  FillCircle: ProgressCircleFillCircle,
});
export type ProgressCircleProps = ProgressCircleRootProps;
export type ProgressCircleTrackProps = ComponentProps<typeof ProgressCircleTrack>;
export type ProgressCircleTrackCircleProps = ComponentProps<typeof ProgressCircleTrackCircle>;
export type ProgressCircleFillCircleProps = ComponentProps<typeof ProgressCircleFillCircle>;
export type ProgressCircleLabelProps = ComponentProps<typeof ProgressCircleLabel>;
export type ProgressCircle = {
  Props: ProgressCircleProps;
  RootProps: ProgressCircleRootProps;
  LabelProps: ProgressCircleLabelProps;
  TrackProps: ProgressCircleTrackProps;
  TrackCircleProps: ProgressCircleTrackCircleProps;
  FillCircleProps: ProgressCircleFillCircleProps;
};
