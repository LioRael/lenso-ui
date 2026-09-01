"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { Slider as BaseSlider } from "@base-ui/react/slider";

import type { StyleXProps } from "../shared/stylex-props.js";
import { styles } from "./slider.stylex.js";

export interface SliderRootProps extends StyleXProps<BaseSlider.Root.Props> {
  "data-visual-state"?: "disabled" | "focus-visible" | "hover" | "pressed" | undefined;
}

export const SliderRoot = React.forwardRef<HTMLDivElement, SliderRootProps>(function SliderRoot(
  { thumbAlignment = "edge", xstyle, ...props },
  ref,
) {
  return (
    <BaseSlider.Root
      {...props}
      className={stylex.props(styles.root, xstyle).className}
      data-slot="slider"
      ref={ref}
      thumbAlignment={thumbAlignment}
    />
  );
});

export const SliderControl = React.forwardRef<
  HTMLDivElement,
  StyleXProps<BaseSlider.Control.Props>
>(function SliderControl({ xstyle, ...props }, ref) {
  return (
    <BaseSlider.Control
      {...props}
      className={stylex.props(styles.control, xstyle).className}
      data-slot="slider-control"
      ref={ref}
    />
  );
});

export const SliderTrack = React.forwardRef<HTMLDivElement, StyleXProps<BaseSlider.Track.Props>>(
  function SliderTrack({ xstyle, ...props }, ref) {
    return (
      <BaseSlider.Track
        {...props}
        className={stylex.props(styles.track, xstyle).className}
        data-slot="slider-track"
        ref={ref}
      />
    );
  },
);

export const SliderIndicator = React.forwardRef<
  HTMLDivElement,
  StyleXProps<BaseSlider.Indicator.Props>
>(function SliderIndicator({ xstyle, ...props }, ref) {
  return (
    <BaseSlider.Indicator
      {...props}
      className={stylex.props(styles.indicator, xstyle).className}
      data-slot="slider-indicator"
      ref={ref}
    />
  );
});

export const SliderThumb = React.forwardRef<HTMLDivElement, StyleXProps<BaseSlider.Thumb.Props>>(
  function SliderThumb({ xstyle, ...props }, ref) {
    return (
      <BaseSlider.Thumb
        {...props}
        className={stylex.props(styles.thumb, xstyle).className}
        data-slot="slider-thumb"
        ref={ref}
      />
    );
  },
);

export const SliderLabel = BaseSlider.Label;
export const SliderValue = BaseSlider.Value;

export const Slider = {
  Control: SliderControl,
  Indicator: SliderIndicator,
  Label: SliderLabel,
  Root: SliderRoot,
  Thumb: SliderThumb,
  Track: SliderTrack,
  Value: SliderValue,
} as const;
