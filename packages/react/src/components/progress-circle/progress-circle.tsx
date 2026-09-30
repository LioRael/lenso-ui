"use client";
// Derived from HeroUI v3.2.6 (Apache-2.0); modified for Base UI, native SVG and StyleX.
import { Progress as Primitive } from "@base-ui/react/progress";
import { createContext, useContext, type ComponentProps } from "react";
import {
  progressCircleStyles,
  progressCircleSizes,
  progressCircleColors,
} from "@lenso/tokens/progress-circle";
import { styledPart, type StyleXProps } from "../../utils/styled.js";
const CENTER = 18;
const RADIUS = 16;
const Context = createContext({
  size: "md" as keyof typeof progressCircleSizes,
  percentage: 0,
  indeterminate: false,
});
const Root = styledPart(Primitive.Root, "progress-circle", progressCircleStyles.root);
const Track = styledPart("svg", "progress-circle-track", progressCircleStyles.track);
const TrackCircle = styledPart(
  "circle",
  "progress-circle-track-circle",
  progressCircleStyles.trackCircle,
);
const FillCircle = styledPart(
  "circle",
  "progress-circle-fill-circle",
  progressCircleStyles.fillCircle,
);
export type ProgressCircleRootProps = StyleXProps<ComponentProps<typeof Primitive.Root>> & {
  size?: keyof typeof progressCircleSizes;
  color?: keyof typeof progressCircleColors;
};
export function ProgressCircleRoot({
  size = "md",
  color = "accent",
  xstyle,
  ...props
}: ProgressCircleRootProps) {
  const min = props.min ?? 0;
  const max = props.max ?? 100;
  const percentage =
    max > min ? Math.max(0, Math.min(100, (((props.value ?? min) - min) / (max - min)) * 100)) : 0;
  return (
    <Context.Provider value={{ size, percentage, indeterminate: props.value === null }}>
      <Root {...props} xstyle={[progressCircleColors[color], xstyle]} />
    </Context.Provider>
  );
}
export function ProgressCircleTrack({ xstyle, ...props }: ComponentProps<typeof Track>) {
  const { size, indeterminate } = useContext(Context);
  return (
    <Track
      viewBox="0 0 36 36"
      fill="none"
      aria-hidden="true"
      {...props}
      xstyle={[
        progressCircleSizes[size],
        indeterminate && progressCircleStyles.indeterminate,
        xstyle,
      ]}
    />
  );
}
export function ProgressCircleTrackCircle(props: ComponentProps<typeof TrackCircle>) {
  return <TrackCircle cx={CENTER} cy={CENTER} r={RADIUS} strokeWidth={4} {...props} />;
}
export function ProgressCircleFillCircle(props: ComponentProps<typeof FillCircle>) {
  const { percentage, indeterminate } = useContext(Context);
  const radius = Number(props.r ?? RADIUS);
  const circumference = 2 * Math.PI * radius;
  const cx = props.cx ?? CENTER;
  const cy = props.cy ?? CENTER;
  return (
    <FillCircle
      cx={CENTER}
      cy={CENTER}
      r={RADIUS}
      strokeWidth={4}
      strokeDasharray={circumference}
      strokeDashoffset={circumference * (indeterminate ? 0.75 : 1 - percentage / 100)}
      strokeLinecap="round"
      transform={`rotate(-90 ${cx} ${cy})`}
      {...props}
    />
  );
}
export const ProgressCircleLabel = styledPart(Primitive.Label, "label");
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
