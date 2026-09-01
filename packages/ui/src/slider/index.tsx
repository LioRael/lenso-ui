"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { Slider as BaseSlider } from "@base-ui/react/slider";

import { mergeClassName } from "../shared/merge-class-name.js";
import { styles } from "./slider.stylex.js";

export interface SliderRootProps extends BaseSlider.Root.Props {
  "data-visual-state"?: "disabled" | "focus-visible" | "hover" | "pressed" | undefined;
}

export const SliderRoot = React.forwardRef<HTMLDivElement, SliderRootProps>(function SliderRoot(
  { className, thumbAlignment = "edge", ...props },
  ref,
) {
  return (
    <BaseSlider.Root
      {...props}
      className={(state) => {
        const generated = stylex.props(styles.root).className;
        const custom = typeof className === "function" ? className(state) : className;
        return custom ? `${generated} ${custom}` : generated;
      }}
      data-slot="slider"
      ref={ref}
      thumbAlignment={thumbAlignment}
    />
  );
});

export const SliderControl = React.forwardRef<HTMLDivElement, BaseSlider.Control.Props>(
  function SliderControl({ className, ...props }, ref) {
    return (
      <BaseSlider.Control
        {...props}
        className={mergeClassName(stylex.props(styles.control).className, className)}
        data-slot="slider-control"
        ref={ref}
      />
    );
  },
);

export const SliderTrack = React.forwardRef<HTMLDivElement, BaseSlider.Track.Props>(
  function SliderTrack({ className, ...props }, ref) {
    return (
      <BaseSlider.Track
        {...props}
        className={mergeClassName(stylex.props(styles.track).className, className)}
        data-slot="slider-track"
        ref={ref}
      />
    );
  },
);

export const SliderIndicator = React.forwardRef<HTMLDivElement, BaseSlider.Indicator.Props>(
  function SliderIndicator({ className, ...props }, ref) {
    return (
      <BaseSlider.Indicator
        {...props}
        className={mergeClassName(stylex.props(styles.indicator).className, className)}
        data-slot="slider-indicator"
        ref={ref}
      />
    );
  },
);

export const SliderThumb = React.forwardRef<HTMLDivElement, BaseSlider.Thumb.Props>(
  function SliderThumb({ className, ...props }, ref) {
    return (
      <BaseSlider.Thumb
        {...props}
        className={mergeClassName(stylex.props(styles.thumb).className, className)}
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
