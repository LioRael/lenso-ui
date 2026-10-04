"use client";
/** HeroUI v3.2.6 derived work. Copyright NextUI Inc. Apache-2.0. Modified for StyleX. */
import { createContext, use, type ComponentPropsWithRef, type CSSProperties } from "react";
import {
  ColorSlider,
  ColorSliderStateContext,
  SliderOutput,
  SliderTrack,
  ColorThumb,
  type ColorChannel,
  type ColorSpace,
} from "react-aria-components/ColorSlider";
import { Label } from "react-aria-components/Label";
import * as stylex from "@stylexjs/stylex";
import { colorSliderStyles as styles } from "@lenso/tokens/color-slider";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";
import { racPart } from "../date-input-group/rac-part.js";
const Orientation = createContext<"horizontal" | "vertical">("horizontal");
const Channel = createContext<ColorChannel>("hue");
const Root = racPart(ColorSlider, "color-slider", (state: { isDisabled: boolean }) => [
  styles.root,
  state.isDisabled && styles.disabled,
]);
export type HSLChannel = "hue" | "saturation" | "lightness" | "alpha";
export type HSBChannel = "hue" | "saturation" | "brightness" | "alpha";
export type RGBChannel = "red" | "green" | "blue" | "alpha";
export type HSLHSBSharedChannel = "hue" | "saturation";
export type AlphaChannel = "alpha";
export type ColorSliderChannelProps =
  | { channel: HSLChannel; colorSpace?: "hsl" }
  | { channel: HSBChannel; colorSpace?: "hsb" }
  | { channel: RGBChannel; colorSpace?: "rgb" }
  | { channel: HSLHSBSharedChannel; colorSpace?: "hsl" | "hsb" }
  | { channel: AlphaChannel; colorSpace?: ColorSpace };
export type ColorSliderRootProps = StyleXProps<
  Omit<ComponentPropsWithRef<typeof ColorSlider>, "channel" | "colorSpace">
> &
  ColorSliderChannelProps;
const requiredColorSpace: Partial<Record<ColorChannel, ColorSpace>> = {
  red: "rgb",
  green: "rgb",
  blue: "rgb",
  lightness: "hsl",
  brightness: "hsb",
};
function getValidColorSpace(channel: ColorChannel, colorSpace?: ColorSpace) {
  if (colorSpace && requiredColorSpace[channel]) return requiredColorSpace[channel];
  if ((channel === "hue" || channel === "saturation") && colorSpace === "rgb") return "hsl";
  return colorSpace;
}
export function ColorSliderRoot({
  orientation = "horizontal",
  channel,
  colorSpace,
  xstyle,
  ...props
}: ColorSliderRootProps) {
  const validColorSpace = getValidColorSpace(channel, colorSpace);
  return (
    <Orientation value={orientation}>
      <Channel value={channel}>
        <Root
          {...props}
          channel={channel}
          {...(validColorSpace ? { colorSpace: validColorSpace } : {})}
          orientation={orientation}
          xstyle={[orientation === "vertical" && styles.vertical, xstyle]}
        />
      </Channel>
    </Orientation>
  );
}
export function ColorSliderLabel({
  xstyle,
  style,
  ...props
}: StyleXProps<ComponentPropsWithRef<typeof Label>>) {
  const compiled = stylex.props(styles.label, xstyle);
  return (
    <Label
      {...props}
      {...compiled}
      data-slot={props["data-slot"] ?? "label"}
      style={mergeStyle(compiled.style, style)}
    />
  );
}
export function ColorSliderOutput({
  children,
  xstyle,
  style,
  ...props
}: StyleXProps<ComponentPropsWithRef<typeof SliderOutput>>) {
  const compiled = stylex.props(styles.output, xstyle);
  return (
    <SliderOutput
      {...props}
      {...compiled}
      data-slot={props["data-slot"] ?? "color-slider-output"}
      style={mergeStyle(compiled.style, style)}
    >
      {children ?? (({ state }) => state.getThumbValueLabel(0))}
    </SliderOutput>
  );
}
const Track = racPart(SliderTrack, "color-slider-track", () => styles.track);
export function ColorSliderTrack({
  xstyle,
  style,
  ...props
}: StyleXProps<ComponentPropsWithRef<typeof SliderTrack>>) {
  const orientation = use(Orientation);
  const channel = use(Channel);
  const slider = use(ColorSliderStateContext);
  const displayColor = slider?.getDisplayColor();
  const range = displayColor?.getChannelRange(channel);
  return (
    <Track
      {...props}
      xstyle={[
        styles.caps,
        orientation === "vertical" && styles.verticalTrack,
        orientation === "vertical" && styles.verticalCaps,
        xstyle,
      ]}
      style={(state) =>
        ({
          ...state.defaultStyle,
          background: `${state.defaultStyle.background},repeating-conic-gradient(#efefef 0% 25%,#f7f7f7 0% 50%) 50% / 16px 16px`,
          "--track-start-color": range
            ? displayColor?.withChannelValue(channel, range.minValue).toString("css")
            : "transparent",
          "--track-end-color": range
            ? displayColor?.withChannelValue(channel, range.maxValue).toString("css")
            : "transparent",
          ...(typeof style === "function" ? style(state) : style),
        }) as CSSProperties
      }
    />
  );
}
const Thumb = racPart(
  ColorThumb,
  "color-slider-thumb",
  (state: { isDragging: boolean; isFocusVisible: boolean; isDisabled: boolean }) => [
    styles.thumb,
    state.isDragging && styles.dragging,
    state.isFocusVisible && styles.focused,
    state.isDisabled && styles.disabled,
  ],
);
export function ColorSliderThumb({
  xstyle,
  ...props
}: StyleXProps<ComponentPropsWithRef<typeof ColorThumb>>) {
  const orientation = use(Orientation);
  return <Thumb {...props} xstyle={[orientation === "vertical" && styles.verticalThumb, xstyle]} />;
}
