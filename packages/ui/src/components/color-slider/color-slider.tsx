"use client";
// Modified: Base UI owns pointer, keyboard, form and focus contracts.
import {
  createContext,
  use,
  type ComponentPropsWithRef,
  type CSSProperties,
  type ReactNode,
} from "react";
import { Slider as Base } from "@base-ui/react/slider";
import { useRender } from "@base-ui/react/use-render";
import { useDirection } from "@base-ui/react/direction-provider";
import { useColorSliderState, type ColorSliderState } from "react-stately/useColorSliderState";
import type { Color, ColorChannel, ColorSpace } from "react-stately/Color";
import * as stylex from "@stylexjs/stylex";
import { useSliderThumbRef } from "../../utils/interaction/slider.js";
import { colorSliderStyles as styles } from "@lenso/tokens/color-slider";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";
import { ColorValueContext } from "../../utils/color-state.js";
import { useLocale } from "../../utils/locale.js";
type ColorSliderRenderState = { [K in keyof Base.Root.State]: Base.Root.State[K] } & {
  isDisabled: boolean;
  isDragging: boolean;
  state: ColorSliderState;
};
const Context = createContext<{
  model: ColorSliderState;
  channel: ColorChannel;
  orientation: "horizontal" | "vertical";
  label?: string;
  labelledBy?: string;
  locale: string;
} | null>(null);
function useModel() {
  const value = use(Context);
  if (!value) throw new Error("ColorSlider parts require ColorSlider.Root");
  return value;
}
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
  Omit<
    ComponentPropsWithRef<typeof Base.Root<number>>,
    "value" | "defaultValue" | "onChange" | "children" | "style" | "render"
  >
> &
  ColorSliderChannelProps & {
    value?: string | Color;
    defaultValue?: string | Color;
    onChange?: (value: Color) => void;
    onChangeEnd?: (value: Color) => void;
    isDisabled?: boolean;
    children?: ReactNode | ((state: ColorSliderRenderState) => ReactNode);
    style?: CSSProperties | ((state: ColorSliderRenderState) => CSSProperties | undefined);
    render?: useRender.RenderProp<ColorSliderRenderState>;
  };
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
  value,
  defaultValue,
  onChange,
  onChangeEnd,
  isDisabled,
  disabled = isDisabled,
  children,
  render,
  style,
  xstyle,
  onValueChange,
  onValueCommitted,
  ...props
}: ColorSliderRootProps) {
  const parent = use(ColorValueContext);
  const { locale } = useLocale();
  const inherits = value === undefined && defaultValue === undefined && parent;
  const model = useColorSliderState({
    locale,
    channel,
    colorSpace: getValidColorSpace(channel, colorSpace),
    value: inherits ? parent.color : value,
    defaultValue,
    isDisabled: disabled,
    onChange(color) {
      if (inherits) parent.setColor(color);
      onChange?.(color);
    },
  });
  const color = model.getDisplayColor();
  const range = color.getChannelRange(channel);
  const compiled = stylex.props(
    styles.root,
    disabled && styles.disabled,
    orientation === "vertical" && styles.vertical,
    xstyle,
  );
  const map = (native: Base.Root.State): ColorSliderRenderState => ({
    ...native,
    isDisabled: native.disabled,
    isDragging: native.dragging,
    state: model,
  });
  return (
    <Context
      value={{
        model,
        channel,
        orientation,
        locale,
        label: props["aria-label"],
        labelledBy: props["aria-labelledby"],
      }}
    >
      <Base.Root<number>
        {...props}
        {...compiled}
        orientation={orientation}
        disabled={disabled}
        min={range.minValue}
        max={range.maxValue}
        step={range.step}
        largeStep={range.pageSize}
        value={model.getThumbValue(0)}
        onValueChange={(next, details) => {
          onValueChange?.(next, details);
          if (!details.isCanceled) model.setThumbValue(0, next);
        }}
        onValueCommitted={(next, details) => {
          onValueCommitted?.(next, details);
          onChangeEnd?.(color.withChannelValue(channel, next));
        }}
        data-slot={props["data-slot"] ?? "color-slider"}
        style={
          typeof style === "function"
            ? (native) => ({ ...compiled.style, ...style(map(native)) })
            : mergeStyle(compiled.style, style)
        }
        render={(nativeProps, nativeState) => (
          <ColorSliderFrame {...nativeProps} render={render} state={map(nativeState)}>
            {typeof children === "function" ? children(map(nativeState)) : children}
          </ColorSliderFrame>
        )}
      />
    </Context>
  );
}
function ColorSliderFrame({
  render,
  state,
  ref,
  ...props
}: useRender.ComponentProps<"div", ColorSliderRenderState> & { state: ColorSliderRenderState }) {
  return useRender({
    defaultTagName: "div",
    render,
    state,
    stateAttributesMapping: { state: () => null },
    ref,
    props,
  });
}
export function ColorSliderLabel({
  xstyle,
  style,
  ...props
}: StyleXProps<ComponentPropsWithRef<typeof Base.Label>>) {
  const compiled = stylex.props(styles.label, xstyle);
  return (
    <Base.Label
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
}: StyleXProps<Omit<ComponentPropsWithRef<typeof Base.Value>, "children">> & {
  children?: ReactNode | ((state: { state: ColorSliderState }) => ReactNode);
}) {
  const { model } = useModel();
  const compiled = stylex.props(styles.output, xstyle);
  return (
    <Base.Value
      {...props}
      {...compiled}
      data-slot={props["data-slot"] ?? "color-slider-output"}
      style={mergeStyle(compiled.style, style)}
    >
      {() =>
        typeof children === "function"
          ? children({ state: model })
          : (children ?? model.getThumbValueLabel(0))
      }
    </Base.Value>
  );
}
export type ColorTrackRenderState = Base.Control.State & {
  color: Color;
  defaultStyle: CSSProperties;
  isDisabled: boolean;
  isDragging: boolean;
};
export type ColorThumbRenderState = Base.Thumb.State & {
  color: Color;
  defaultStyle: CSSProperties;
  isDisabled: boolean;
  isDragging: boolean;
};
export type ColorSliderTrackProps = StyleXProps<
  Omit<ComponentPropsWithRef<typeof Base.Control>, "style">
> & { style?: CSSProperties | ((state: ColorTrackRenderState) => CSSProperties | undefined) };
export type ColorSliderThumbProps = StyleXProps<
  Omit<ComponentPropsWithRef<typeof Base.Thumb>, "style">
> & { style?: CSSProperties | ((state: ColorThumbRenderState) => CSSProperties | undefined) };
export function ColorSliderTrack({ xstyle, style, ...props }: ColorSliderTrackProps) {
  const { model, channel, orientation } = useModel();
  const direction = useDirection();
  const color = model.getDisplayColor();
  const range = color.getChannelRange(channel);
  const to = orientation === "vertical" ? "top" : direction === "rtl" ? "left" : "right";
  const stops =
    channel === "hue"
      ? [0, 60, 120, 180, 240, 300, 360]
      : channel === "lightness"
        ? [range.minValue, (range.maxValue + range.minValue) / 2, range.maxValue]
        : [range.minValue, range.maxValue];
  const gradient = `linear-gradient(to ${to}, ${stops.map((stop) => color.withChannelValue(channel, stop).toString("css")).join(", ")})`;
  const compiled = stylex.props(
    styles.track,
    styles.caps,
    orientation === "vertical" && styles.verticalTrack,
    orientation === "vertical" && styles.verticalCaps,
    xstyle,
  );
  return (
    <Base.Control
      data-lg-slider-control=""
      {...props}
      {...compiled}
      data-slot={props["data-slot"] ?? "color-slider-track"}
      style={(native) =>
        ({
          ...compiled.style,
          forcedColorAdjust: "none",
          background: `${gradient},var(--lenso-color-checkerboard) 50% / 16px 16px`,
          "--track-start-color": color.withChannelValue(channel, range.minValue).toString("css"),
          "--track-end-color": color.withChannelValue(channel, range.maxValue).toString("css"),
          ...(typeof style === "function"
            ? style({
                ...native,
                color,
                defaultStyle: { background: gradient, forcedColorAdjust: "none" },
                isDisabled: native.disabled,
                isDragging: native.dragging,
              })
            : style),
        }) as CSSProperties
      }
    />
  );
}
export function ColorSliderThumb({
  ref,
  children,
  xstyle,
  style,
  ...props
}: ColorSliderThumbProps) {
  const { orientation, model, channel, label, labelledBy, locale } = useModel();
  const presentationRef = useSliderThumbRef(ref);
  const compiled = stylex.props(
    styles.thumb,
    orientation === "vertical" && styles.verticalThumb,
    xstyle,
  );
  const color = model.getDisplayColor();
  return (
    <Base.Thumb
      ref={presentationRef}
      data-lg-slider-thumb=""
      {...props}
      {...compiled}
      index={0}
      aria-label={props["aria-label"] ?? label ?? color.getChannelName(channel, locale)}
      aria-labelledby={props["aria-labelledby"] ?? labelledBy}
      getAriaValueText={() =>
        `${model.getThumbValueLabel(0)}, ${channel === "hue" ? color.getHueName(locale) : color.getColorName(locale)}`
      }
      data-slot={props["data-slot"] ?? "color-slider-thumb"}
      style={(native) => ({
        ...compiled.style,
        "--lg-color-thumb": color.toString("css"),
        ...(typeof style === "function"
          ? style({
              ...native,
              color,
              defaultStyle: { backgroundColor: color.toString("css") },
              isDisabled: native.disabled,
              isDragging: native.dragging,
            })
          : style),
      })}
    >
      <span aria-hidden="true" {...stylex.props(styles.optical)} />
      {children}
    </Base.Thumb>
  );
}
