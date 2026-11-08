"use client";
// Modified: native Base UI range, multi-thumb and keyboard contracts.
import { Slider as BaseSlider } from "@base-ui/react/slider";
import { KnobMaterial } from "../../utils/materials/knob.js";
import { sliderStyles } from "@lenso/tokens/slider";
import { useSliderThumbRef } from "../../utils/interaction/slider.js";
import type { ComponentPropsWithRef } from "react";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";
import type * as React from "react";
import * as stylex from "@stylexjs/stylex";

export type SliderRootProps = StyleXProps<
  Omit<BaseSlider.Root.Props, "ref"> & {
    ref?: React.ComponentPropsWithRef<typeof BaseSlider.Root>["ref"];
  }
> & { "data-slot"?: unknown };
export function SliderRoot({ thumbAlignment = "edge", xstyle, style, ...props }: SliderRootProps) {
  const compiled = stylex.props(sliderStyles.root, xstyle);
  return (
    <BaseSlider.Root
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-slot={props["data-slot"] ?? "slider"}
      thumbAlignment={thumbAlignment}
    />
  );
}
export function SliderLabel({
  xstyle,
  style,
  ...props
}: StyleXProps<
  Omit<BaseSlider.Label.Props, "ref"> & {
    ref?: React.ComponentPropsWithRef<typeof BaseSlider.Label>["ref"];
  }
> & { "data-slot"?: unknown }) {
  const compiled = stylex.props(sliderStyles.label, xstyle);
  return (
    <BaseSlider.Label
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-slot={props["data-slot"] ?? "slider-label"}
    />
  );
}
export function SliderOutput({
  xstyle,
  style,
  ...props
}: StyleXProps<
  Omit<BaseSlider.Value.Props, "ref"> & {
    ref?: React.ComponentPropsWithRef<typeof BaseSlider.Value>["ref"];
  }
> & { "data-slot"?: unknown }) {
  const compiled = stylex.props(sliderStyles.output, xstyle);
  return (
    <BaseSlider.Value
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-slot={props["data-slot"] ?? "slider-output"}
    />
  );
}
export function SliderControl({
  xstyle,
  style,
  ...props
}: StyleXProps<
  Omit<BaseSlider.Control.Props, "ref"> & {
    ref?: React.ComponentPropsWithRef<typeof BaseSlider.Control>["ref"];
  }
> & { "data-slot"?: unknown }) {
  const compiled = stylex.props(sliderStyles.control, xstyle);
  return (
    <BaseSlider.Control
      data-lg-slider-control=""
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-slot={props["data-slot"] ?? "slider-control"}
    />
  );
}
export function SliderTrack({
  xstyle,
  style,
  children,
  ...props
}: StyleXProps<
  Omit<BaseSlider.Track.Props, "ref"> & {
    ref?: React.ComponentPropsWithRef<typeof BaseSlider.Track>["ref"];
  }
> & { "data-slot"?: unknown }) {
  const compiled = stylex.props(sliderStyles.track, xstyle);
  return (
    <BaseSlider.Track
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-slot={props["data-slot"] ?? "slider-track"}
    >
      <span
        aria-hidden="true"
        data-slot="slider-track-paint"
        {...stylex.props(sliderStyles.trackPaint)}
      />
      {children}
    </BaseSlider.Track>
  );
}
export function SliderFill({
  xstyle,
  style,
  ...props
}: StyleXProps<
  Omit<BaseSlider.Indicator.Props, "ref"> & {
    ref?: React.ComponentPropsWithRef<typeof BaseSlider.Indicator>["ref"];
  }
> & { "data-slot"?: unknown }) {
  const compiled = stylex.props(sliderStyles.fill, xstyle);
  return (
    <BaseSlider.Indicator
      {...props}
      {...compiled}
      style={(state) => {
        const percent = (value: number) =>
          `${state.max > state.min ? Math.min(1, Math.max(0, (value - state.min) / (state.max - state.min))) * 100 : 0}%`;
        const first = state.values[0] ?? state.min;
        const last = state.values[state.values.length - 1] ?? first;
        return {
          ...compiled.style,
          width: "100%",
          height: "100%",
          insetInlineStart: 0,
          bottom: 0,
          "--lg-slider-start": state.values.length > 1 ? percent(first) : "0%",
          "--lg-slider-end": percent(last),
          "--lg-slider-direction": state.orientation === "vertical" ? "to top" : "to right",
          ...(typeof style === "function" ? style(state) : style),
        } as React.CSSProperties;
      }}
      data-slot={props["data-slot"] ?? "slider-fill"}
    />
  );
}
export function SliderThumb({
  xstyle,
  style,
  ref,
  children,
  ...props
}: StyleXProps<
  Omit<BaseSlider.Thumb.Props, "ref"> & {
    ref?: React.ComponentPropsWithRef<typeof BaseSlider.Thumb>["ref"];
  }
> & { "data-slot"?: unknown }) {
  const presentationRef = useSliderThumbRef(ref);
  const compiled = stylex.props(sliderStyles.thumb, xstyle);
  return (
    <BaseSlider.Thumb
      data-lg-slider-thumb=""
      {...props}
      {...compiled}
      ref={presentationRef}
      style={mergeStyle(compiled.style, style)}
      data-slot={props["data-slot"] ?? "slider-thumb"}
    >
      <span
        aria-hidden="true"
        data-slot="slider-optical"
        {...stylex.props(sliderStyles.optical, sliderStyles.knobMaterial)}
      >
        <KnobMaterial kind="slider" controlEdge />
      </span>
      {children}
    </BaseSlider.Thumb>
  );
}
export function SliderMarks({
  xstyle,
  style,
  ...props
}: StyleXProps<React.ComponentPropsWithRef<"div">> & { "data-slot"?: unknown }) {
  const compiled = stylex.props(sliderStyles.marks, xstyle);
  return (
    <div
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-slot={props["data-slot"] ?? "slider-marks"}
    />
  );
}
export type SliderLabelProps = ComponentPropsWithRef<typeof SliderLabel>;
export type SliderOutputProps = ComponentPropsWithRef<typeof SliderOutput>;
export type SliderControlProps = ComponentPropsWithRef<typeof SliderControl>;
export type SliderTrackProps = ComponentPropsWithRef<typeof SliderTrack>;
export type SliderFillProps = ComponentPropsWithRef<typeof SliderFill>;
export type SliderThumbProps = ComponentPropsWithRef<typeof SliderThumb>;
export type SliderMarksProps = ComponentPropsWithRef<typeof SliderMarks>;
