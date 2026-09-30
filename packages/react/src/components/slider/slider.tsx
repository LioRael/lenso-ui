"use client";
/**
 * Derived from HeroUI v3.2.6. SPDX-License-Identifier: Apache-2.0
 * Modified: native Base UI range, multi-thumb and keyboard contracts.
 */
import { Slider as BaseSlider } from "@base-ui/react/slider";
import { sliderStyles } from "@lenso/tokens/slider";
import type { ComponentPropsWithRef } from "react";
import { styledPart } from "../../utils/styled.js";

const Root = styledPart(BaseSlider.Root, "slider", sliderStyles.root);
export type SliderRootProps = ComponentPropsWithRef<typeof Root>;
export function SliderRoot({ thumbAlignment = "edge", ...props }: SliderRootProps) {
  return <Root {...props} thumbAlignment={thumbAlignment} />;
}
export const SliderLabel = styledPart(BaseSlider.Label, "slider-label", sliderStyles.label);
export const SliderOutput = styledPart(BaseSlider.Value, "slider-output", sliderStyles.output);
export const SliderControl = styledPart(BaseSlider.Control, "slider-control", sliderStyles.control);
export const SliderTrack = styledPart(BaseSlider.Track, "slider-track", sliderStyles.track);
export const SliderFill = styledPart(BaseSlider.Indicator, "slider-fill", sliderStyles.fill);
export const SliderThumb = styledPart(BaseSlider.Thumb, "slider-thumb", sliderStyles.thumb);
export const SliderMarks = styledPart("div", "slider-marks", sliderStyles.marks);
export type SliderLabelProps = ComponentPropsWithRef<typeof SliderLabel>;
export type SliderOutputProps = ComponentPropsWithRef<typeof SliderOutput>;
export type SliderControlProps = ComponentPropsWithRef<typeof SliderControl>;
export type SliderTrackProps = ComponentPropsWithRef<typeof SliderTrack>;
export type SliderFillProps = ComponentPropsWithRef<typeof SliderFill>;
export type SliderThumbProps = ComponentPropsWithRef<typeof SliderThumb>;
export type SliderMarksProps = ComponentPropsWithRef<typeof SliderMarks>;
