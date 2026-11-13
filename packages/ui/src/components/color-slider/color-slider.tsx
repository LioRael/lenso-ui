"use client";
import { formatNumber } from "@ui-sdk/core/number";
import { createContext, use, useMemo, type ComponentProps } from "react";
import type { ColorSpace, ColorChannel } from "react-stately/Color";
import * as Sdk from "@ui-sdk/react/color-picker";
import { Field, FieldLabel } from "@ui-sdk/react/field";
import { renderElement, type PartProps } from "@ui-sdk/react/primitive";
import * as stylex from "@stylexjs/stylex";
import { colorSliderStyles as styles } from "@lenso/tokens/color-slider";
import { ColorScope, ColorValueContext, type ColorScopeProps } from "../../utils/color-state.js";
import { slotRender } from "../../utils/sdk-render.js";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";
import { useLocale } from "../../utils/locale.js";
import { useSliderThumbRef } from "../../utils/interaction/slider.js";
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
type Channels = { channel: ColorChannel; orientation: "horizontal" | "vertical" };
const Context = createContext<Channels | null>(null);
function useChannels() {
  const channels = use(Context);
  if (!channels) throw new Error("ColorSlider parts require ColorSlider.Root");
  return channels;
}
export type ColorSliderRootProps = StyleXProps<ColorScopeProps> &
  ColorSliderChannelProps & {
    isDisabled?: boolean;
    orientation?: "horizontal" | "vertical";
  };
export function ColorSliderRoot({
  value,
  defaultValue,
  onChange,
  onChangeEnd,
  onValueChange,
  onValueCommit,
  controller,
  name,
  form,
  disabled,
  isDisabled,
  readOnly,
  required,
  format,
  gamut,
  space,
  colorSpace,
  channel,
  orientation = "horizontal",
  ...props
}: ColorSliderRootProps) {
  const parent = use(ColorValueContext);
  const channels = useMemo(() => ({ channel, orientation }), [channel, orientation]);
  const presentation = <SliderRoot {...props} />;
  if (parent && value === undefined && defaultValue === undefined)
    return (
      <Context value={channels}>
        <Field>{presentation}</Field>
      </Context>
    );
  const inferred =
    channel === "red" || channel === "green" || channel === "blue"
      ? "srgb"
      : channel === "lightness"
        ? "hsl"
        : "hsv";
  return (
    <Context value={channels}>
      <Field>
        <ColorScope
          {...props}
          value={value}
          defaultValue={defaultValue}
          onChange={onChange}
          onChangeEnd={onChangeEnd}
          onValueChange={onValueChange}
          onValueCommit={onValueCommit}
          controller={controller}
          name={name}
          form={form}
          disabled={disabled ?? isDisabled}
          readOnly={readOnly}
          required={required}
          format={format}
          gamut={gamut}
          space={
            space ??
            (colorSpace === "rgb" ? "srgb" : colorSpace === "hsb" ? "hsv" : colorSpace) ??
            inferred
          }
          style={{ display: "contents" }}
        >
          {presentation}
        </ColorScope>
      </Field>
    </Context>
  );
}
function SliderRoot({ xstyle, style, render, children, ...props }: StyleXProps<ColorScopeProps>) {
  const scope = use(ColorValueContext)!;
  const { orientation } = useChannels();
  const compiled = stylex.props(
    styles.root,
    scope.native.disabled && styles.disabled,
    orientation === "vertical" && styles.vertical,
    xstyle,
  );
  return renderElement(
    "div",
    {
      ...props,
      ...compiled,
      style:
        typeof style === "function"
          ? { ...compiled.style, ...style(scope.native) }
          : mergeStyle(compiled.style, style),
      "data-lenso-slot": props["data-lenso-slot"] ?? "color-slider",
      children: typeof children === "function" ? children(scope) : children,
    },
    render,
    scope.native,
  );
}
export function ColorSliderLabel({
  xstyle,
  style,
  ...props
}: StyleXProps<ComponentProps<typeof FieldLabel>>) {
  const compiled = stylex.props(styles.label, xstyle);
  return (
    <FieldLabel
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      render={slotRender("label", "color-slider-label", props.render)}
    />
  );
}
export function ColorSliderOutput({
  xstyle,
  style,
  render,
  children,
  ...props
}: StyleXProps<PartProps<"output">>) {
  const scope = use(ColorValueContext)!;
  const { channel } = useChannels();
  const { locale } = useLocale();
  const color = scope.color;
  const value = color.getChannelValue(channel);
  const format = color.getChannelFormatOptions(channel);
  const compiled = stylex.props(styles.output, xstyle);
  return renderElement(
    "output",
    {
      ...props,
      ...compiled,
      style: mergeStyle(compiled.style, style),
      children:
        children ??
        formatNumber(
          format.style === "percent" && channel !== "alpha" ? value / 100 : value,
          locale,
          format,
        ),
      "data-lenso-slot": "color-slider-output",
    },
    render,
  );
}
export type ColorSliderTrackProps = StyleXProps<ComponentProps<typeof Sdk.ColorPickerSlider>>;
export function ColorSliderTrack({ xstyle, style, ...props }: ColorSliderTrackProps) {
  const { channel, orientation } = useChannels();
  const compiled = stylex.props(
    styles.track,
    styles.caps,
    orientation === "vertical" && styles.verticalTrack,
    orientation === "vertical" && styles.verticalCaps,
    xstyle,
  );
  return (
    <Sdk.ColorPickerSlider
      {...props}
      {...compiled}
      channel={channel}
      orientation={orientation}
      data-lg-slider-control=""
      style={mergeStyle(compiled.style, style)}
      render={slotRender("div", "color-slider-track", props.render)}
    />
  );
}
export type ColorSliderThumbProps = StyleXProps<ComponentProps<typeof Sdk.ColorPickerSliderThumb>>;
export function ColorSliderThumb({
  xstyle,
  style,
  children,
  ref,
  ...props
}: ColorSliderThumbProps) {
  const { channel, orientation } = useChannels();
  const presentationRef = useSliderThumbRef(ref);
  const compiled = stylex.props(
    styles.thumb,
    orientation === "vertical" && styles.verticalThumb,
    xstyle,
  );
  return (
    <Sdk.ColorPickerSliderThumb
      {...props}
      {...compiled}
      channel={channel}
      orientation={orientation}
      ref={presentationRef}
      data-lg-slider-thumb=""
      style={mergeStyle(compiled.style, style)}
      render={slotRender("div", "color-slider-thumb", props.render)}
    >
      {(native) => (
        <>
          <span
            aria-hidden="true"
            {...stylex.props(styles.optical)}
            style={{ backgroundColor: "var(--color-picker-color)" }}
          />
          {typeof children === "function" ? children(native) : children}
        </>
      )}
    </Sdk.ColorPickerSliderThumb>
  );
}
