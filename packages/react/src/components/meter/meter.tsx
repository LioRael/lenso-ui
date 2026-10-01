"use client";
// Derived from HeroUI v3.2.6 (Apache-2.0); modified for Base UI and StyleX.
import { Meter as Primitive } from "@base-ui/react/meter";
import { createContext, useContext, type ComponentProps } from "react";
import { meterStyles, meterColors, meterTrackSizes, meterFillSizes } from "@lenso/tokens/meter";
import * as stylex from "@stylexjs/stylex";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";
const SizeContext = createContext<keyof typeof meterTrackSizes>("md");
export type MeterRootProps = StyleXProps<Primitive.Root.Props> & {
  size?: keyof typeof meterTrackSizes;
  color?: keyof typeof meterColors;
};
export function MeterRoot({
  size = "md",
  color = "accent",
  xstyle,
  style,
  ...props
}: MeterRootProps) {
  const compiled = stylex.props(meterStyles.root, meterColors[color], xstyle);
  return (
    <SizeContext.Provider value={size}>
      <Primitive.Root
        {...props}
        data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "meter"}
        {...compiled}
        style={mergeStyle<Primitive.Root.State>(compiled.style, style)}
      />
    </SizeContext.Provider>
  );
}
export function MeterTrack({ xstyle, style, ...props }: StyleXProps<Primitive.Track.Props>) {
  const size = useContext(SizeContext);
  const compiled = stylex.props(meterStyles.track, meterTrackSizes[size], xstyle);
  return (
    <Primitive.Track
      {...props}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "meter-track"}
      {...compiled}
      style={mergeStyle<Primitive.Track.State>(compiled.style, style)}
    />
  );
}
export function MeterFill({ xstyle, style, ...props }: StyleXProps<Primitive.Indicator.Props>) {
  const size = useContext(SizeContext);
  const compiled = stylex.props(meterStyles.fill, meterFillSizes[size], xstyle);
  return (
    <Primitive.Indicator
      {...props}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "meter-fill"}
      {...compiled}
      style={mergeStyle<Primitive.Indicator.State>(compiled.style, style)}
    />
  );
}
export function MeterLabel({ xstyle, style, ...props }: StyleXProps<Primitive.Label.Props>) {
  const compiled = stylex.props(meterStyles.label, xstyle);
  return (
    <Primitive.Label
      {...props}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "label"}
      {...compiled}
      style={mergeStyle<Primitive.Label.State>(compiled.style, style)}
    />
  );
}
export function MeterOutput({ xstyle, style, ...props }: StyleXProps<Primitive.Value.Props>) {
  const compiled = stylex.props(meterStyles.output, xstyle);
  return (
    <Primitive.Value
      {...props}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "meter-output"}
      {...compiled}
      style={mergeStyle<Primitive.Value.State>(compiled.style, style)}
    />
  );
}
export const Meter = Object.assign(MeterRoot, {
  Root: MeterRoot,
  Label: MeterLabel,
  Output: MeterOutput,
  Track: MeterTrack,
  Fill: MeterFill,
});
export type MeterProps = MeterRootProps;
export type MeterLabelProps = ComponentProps<typeof MeterLabel>;
export type MeterOutputProps = ComponentProps<typeof MeterOutput>;
export type MeterTrackProps = ComponentProps<typeof MeterTrack>;
export type MeterFillProps = ComponentProps<typeof MeterFill>;
export type Meter = {
  Props: MeterProps;
  RootProps: MeterRootProps;
  LabelProps: MeterLabelProps;
  OutputProps: MeterOutputProps;
  TrackProps: MeterTrackProps;
  FillProps: MeterFillProps;
};
