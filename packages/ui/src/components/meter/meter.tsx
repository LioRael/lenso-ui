"use client";
// Modified: UI SDK behavior and StyleX.
import * as Primitive from "@ui-sdk/react/meter";
import { slotRender } from "../../utils/sdk-render.js";
import { createContext, useContext, type ComponentProps } from "react";
import { meterStyles, meterColors, meterTrackSizes, meterFillSizes } from "@lenso/tokens/meter";
import * as stylex from "@stylexjs/stylex";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";
const SizeContext = createContext<keyof typeof meterTrackSizes>("md");
export type MeterRootProps = StyleXProps<ComponentProps<typeof Primitive.Meter>> & {
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
      <Primitive.Meter
        {...props}
        data-lenso-slot={(props as { "data-lenso-slot"?: string })["data-lenso-slot"] ?? "meter"}
        render={slotRender("div", props["data-lenso-slot"] ?? "meter", props.render)}
        {...compiled}
        style={mergeStyle<Primitive.MeterState>(compiled.style, style)}
      />
    </SizeContext.Provider>
  );
}
export function MeterTrack({
  xstyle,
  style,
  ...props
}: StyleXProps<ComponentProps<typeof Primitive.MeterTrack>>) {
  const size = useContext(SizeContext);
  const compiled = stylex.props(meterStyles.track, meterTrackSizes[size], xstyle);
  return (
    <Primitive.MeterTrack
      {...props}
      data-lenso-slot={
        (props as { "data-lenso-slot"?: string })["data-lenso-slot"] ?? "meter-track"
      }
      render={slotRender("div", props["data-lenso-slot"] ?? "meter-track", props.render)}
      {...compiled}
      style={mergeStyle<Primitive.MeterState>(compiled.style, style)}
    />
  );
}
export function MeterFill({
  xstyle,
  style,
  ...props
}: StyleXProps<ComponentProps<typeof Primitive.MeterIndicator>>) {
  const size = useContext(SizeContext);
  const compiled = stylex.props(meterStyles.fill, meterFillSizes[size], xstyle);
  return (
    <Primitive.MeterIndicator
      {...props}
      data-lenso-slot={(props as { "data-lenso-slot"?: string })["data-lenso-slot"] ?? "meter-fill"}
      render={slotRender("div", props["data-lenso-slot"] ?? "meter-fill", props.render)}
      {...compiled}
      style={mergeStyle<Primitive.MeterState>(compiled.style, style)}
    />
  );
}
export function MeterLabel({
  xstyle,
  style,
  ...props
}: StyleXProps<ComponentProps<typeof Primitive.MeterLabel>>) {
  const compiled = stylex.props(meterStyles.label, xstyle);
  return (
    <Primitive.MeterLabel
      {...props}
      data-lenso-slot={(props as { "data-lenso-slot"?: string })["data-lenso-slot"] ?? "label"}
      render={slotRender("span", props["data-lenso-slot"] ?? "label", props.render)}
      {...compiled}
      style={mergeStyle<Primitive.MeterState>(compiled.style, style)}
    />
  );
}
export function MeterOutput({
  xstyle,
  style,
  ...props
}: StyleXProps<ComponentProps<typeof Primitive.MeterValue>>) {
  const compiled = stylex.props(meterStyles.output, xstyle);
  return (
    <Primitive.MeterValue
      {...props}
      data-lenso-slot={
        (props as { "data-lenso-slot"?: string })["data-lenso-slot"] ?? "meter-output"
      }
      render={slotRender("span", props["data-lenso-slot"] ?? "meter-output", props.render)}
      {...compiled}
      style={mergeStyle<Primitive.MeterValueState>(compiled.style, style)}
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
