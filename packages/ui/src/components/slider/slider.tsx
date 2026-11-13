"use client";
import { Field as SdkField, FieldLabel as SdkFieldLabel } from "@ui-sdk/react/field";
// Modified: native UI SDK range, multi-thumb and keyboard contracts.
import {
  Slider as SdkSlider,
  SliderValue as SdkSliderValue,
  SliderControl as SdkSliderControl,
  SliderTrack as SdkSliderTrack,
  SliderIndicator as SdkSliderIndicator,
  SliderThumb as SdkSliderThumb,
} from "@ui-sdk/react/slider";
import { slotRender } from "../../utils/sdk-render.js";
import { KnobMaterial } from "../../utils/materials/knob.js";
import { sliderStyles } from "@lenso/tokens/slider";
import { useSliderThumbRef } from "../../utils/interaction/slider.js";
import { useFocusMethodRef } from "../../utils/interaction/focus-method.js";
import type { ComponentPropsWithRef } from "react";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";
import type * as React from "react";
import * as stylex from "@stylexjs/stylex";

export type SliderRootProps = StyleXProps<
  Omit<React.ComponentProps<typeof SdkSlider>, "ref"> & {
    ref?: React.ComponentPropsWithRef<typeof SdkSlider>["ref"];
  }
> & { "data-lenso-slot"?: unknown };
export function SliderRoot({ xstyle, style, ...props }: SliderRootProps) {
  const compiled = stylex.props(sliderStyles.root, xstyle);
  return (
    <SdkField {...stylex.props(sliderStyles.field)}>
      <SdkSlider
        {...props}
        {...compiled}
        style={mergeStyle(compiled.style, style)}
        render={slotRender("div", props["data-lenso-slot"] ?? "slider", props.render)}
      />
    </SdkField>
  );
}
export function SliderLabel({
  xstyle,
  style,
  ...props
}: StyleXProps<
  Omit<React.ComponentProps<typeof SdkFieldLabel>, "ref"> & {
    ref?: React.ComponentPropsWithRef<typeof SdkFieldLabel>["ref"];
  }
> & { "data-lenso-slot"?: unknown }) {
  const compiled = stylex.props(sliderStyles.label, xstyle);
  return (
    <SdkFieldLabel
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      render={slotRender("label", props["data-lenso-slot"] ?? "slider-label", props.render)}
    />
  );
}
export function SliderOutput({
  xstyle,
  style,
  ...props
}: StyleXProps<
  Omit<React.ComponentProps<typeof SdkSliderValue>, "ref"> & {
    ref?: React.ComponentPropsWithRef<typeof SdkSliderValue>["ref"];
  }
> & { "data-lenso-slot"?: unknown }) {
  const compiled = stylex.props(sliderStyles.output, xstyle);
  return (
    <SdkSliderValue
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      render={slotRender("output", props["data-lenso-slot"] ?? "slider-output", props.render)}
    />
  );
}
export function SliderControl({
  xstyle,
  style,
  ...props
}: StyleXProps<
  Omit<React.ComponentProps<typeof SdkSliderControl>, "ref"> & {
    ref?: React.ComponentPropsWithRef<typeof SdkSliderControl>["ref"];
  }
> & { "data-lenso-slot"?: unknown }) {
  const compiled = stylex.props(sliderStyles.control, xstyle);
  return (
    <SdkSliderControl
      data-lg-slider-control=""
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      render={slotRender("div", props["data-lenso-slot"] ?? "slider-control", props.render)}
    />
  );
}
export function SliderTrack({
  xstyle,
  style,
  children,
  ...props
}: StyleXProps<
  Omit<React.ComponentProps<typeof SdkSliderTrack>, "ref"> & {
    ref?: React.ComponentPropsWithRef<typeof SdkSliderTrack>["ref"];
  }
> & { "data-lenso-slot"?: unknown }) {
  const compiled = stylex.props(sliderStyles.track, xstyle);
  return (
    <SdkSliderTrack
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      render={slotRender("div", props["data-lenso-slot"] ?? "slider-track", props.render)}
    >
      {(state) => (
        <>
          <span
            aria-hidden="true"
            data-lenso-slot="slider-track-paint"
            {...stylex.props(sliderStyles.trackPaint)}
          />
          {typeof children === "function" ? children(state) : children}
        </>
      )}
    </SdkSliderTrack>
  );
}
export function SliderFill({
  xstyle,
  style,
  ...props
}: StyleXProps<
  Omit<React.ComponentProps<typeof SdkSliderIndicator>, "ref"> & {
    ref?: React.ComponentPropsWithRef<typeof SdkSliderIndicator>["ref"];
  }
> & { "data-lenso-slot"?: unknown }) {
  const compiled = stylex.props(sliderStyles.fill, xstyle);
  return (
    <SdkSliderIndicator
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      render={slotRender("div", props["data-lenso-slot"] ?? "slider-fill", props.render)}
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
  Omit<React.ComponentProps<typeof SdkSliderThumb>, "ref"> & {
    ref?: React.ComponentPropsWithRef<typeof SdkSliderThumb>["ref"];
  }
> & { "data-lenso-slot"?: unknown }) {
  const presentationRef = useFocusMethodRef(useSliderThumbRef(ref));
  const compiled = stylex.props(sliderStyles.thumb, xstyle);
  return (
    <SdkSliderThumb
      data-lg-slider-thumb=""
      {...props}
      {...compiled}
      ref={presentationRef}
      style={mergeStyle(compiled.style, style)}
      render={slotRender("div", props["data-lenso-slot"] ?? "slider-thumb", props.render)}
    >
      {(state) => (
        <>
          <span
            aria-hidden="true"
            data-lenso-slot="slider-optical"
            {...stylex.props(sliderStyles.optical, sliderStyles.knobMaterial)}
          >
            <KnobMaterial kind="slider" controlEdge />
          </span>
          {typeof children === "function" ? children(state) : children}
        </>
      )}
    </SdkSliderThumb>
  );
}
export function SliderMarks({
  xstyle,
  style,
  ...props
}: StyleXProps<React.ComponentPropsWithRef<"div">> & { "data-lenso-slot"?: unknown }) {
  const compiled = stylex.props(sliderStyles.marks, xstyle);
  return (
    <div
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-lenso-slot={props["data-lenso-slot"] ?? "slider-marks"}
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
