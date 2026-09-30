"use client";
// Derived from HeroUI v3.2.6 (Apache-2.0); modified for Base UI and StyleX.
import { Meter as Primitive } from "@base-ui/react/meter";
import { createContext, useContext, type ComponentProps } from "react";
import { meterStyles, meterColors, meterTrackSizes, meterFillSizes } from "@lenso/tokens/meter";
import { styledPart, type StyleXProps } from "../../utils/styled.js";
const SizeContext = createContext<keyof typeof meterTrackSizes>("md");
const Root = styledPart(Primitive.Root, "meter", meterStyles.root);
const Track = styledPart(Primitive.Track, "meter-track", meterStyles.track);
const Fill = styledPart(Primitive.Indicator, "meter-fill", meterStyles.fill);
export type MeterRootProps = StyleXProps<ComponentProps<typeof Primitive.Root>> & {
  size?: keyof typeof meterTrackSizes;
  color?: keyof typeof meterColors;
};
export function MeterRoot({ size = "md", color = "accent", xstyle, ...props }: MeterRootProps) {
  return (
    <SizeContext.Provider value={size}>
      <Root {...props} xstyle={[meterColors[color], xstyle]} />
    </SizeContext.Provider>
  );
}
export function MeterTrack({ xstyle, ...props }: ComponentProps<typeof Track>) {
  const size = useContext(SizeContext);
  return <Track {...props} xstyle={[meterTrackSizes[size], xstyle]} />;
}
export function MeterFill({ xstyle, ...props }: ComponentProps<typeof Fill>) {
  const size = useContext(SizeContext);
  return <Fill {...props} xstyle={[meterFillSizes[size], xstyle]} />;
}
export const MeterLabel = styledPart(Primitive.Label, "label", meterStyles.label);
export const MeterOutput = styledPart(Primitive.Value, "meter-output", meterStyles.output);
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
