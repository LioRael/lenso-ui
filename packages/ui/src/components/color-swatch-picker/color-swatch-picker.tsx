"use client";
// Copyright NextUI Inc. Apache-2.0. Modified: UI SDK radio selection and native form behavior.
import {
  createContext,
  use,
  type ComponentPropsWithRef,
  type ReactNode,
  type CSSProperties,
} from "react";
import {
  ColorPickerSwatches,
  ColorPickerSwatchItem,
  type ColorPickerSwatchItemState,
} from "@ui-sdk/react/color-picker";
import { renderElement, type RenderProp } from "@ui-sdk/react/primitive";
import { slotRender } from "../../utils/sdk-render.js";
import { parseColor, type Color } from "react-stately/Color";
import * as stylex from "@stylexjs/stylex";
import { colorSwatchPickerStyles as styles } from "@lenso/tokens/color-swatch-picker";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";
import { ColorScope, ColorValueContext, type ColorScopeProps } from "../../utils/color-state.js";
import { ColorSwatchRoot, type ColorSwatchRootProps } from "../color-swatch/color-swatch.js";
type Size = "xs" | "sm" | "md" | "lg" | "xl";
export type ColorSwatchPickerItemRenderProps = ColorPickerSwatchItemState & { color: Color };
const Options = createContext<{
  size: Size;
  variant: "circle" | "square";
  color: Color | null;
  disabled: boolean;
  palette: boolean;
}>({ size: "md", variant: "circle", color: null, disabled: false, palette: false });
const ItemState = createContext<ColorSwatchPickerItemRenderProps | null>(null);
export type ColorSwatchPickerRootProps = StyleXProps<ColorScopeProps> & {
  size?: Size;
  variant?: "circle" | "square";
  layout?: "grid" | "stack" | "palette";
  isDisabled?: boolean;
};
export function ColorSwatchPickerRoot({
  size = "md",
  variant = "circle",
  layout = "grid",
  value,
  defaultValue,
  onChange,
  onChangeEnd,
  onValueChange,
  onValueCommit,
  isDisabled,
  disabled = isDisabled,
  controller,
  name,
  form,
  required,
  readOnly,
  space,
  format,
  gamut,
  ...props
}: ColorSwatchPickerRootProps) {
  const parent = use(ColorValueContext);
  const swatches = <Swatches {...props} size={size} variant={variant} layout={layout} />;
  if (parent && value === undefined && defaultValue === undefined) return swatches;
  return (
    <ColorScope
      value={value}
      defaultValue={defaultValue}
      onChange={onChange}
      onChangeEnd={onChangeEnd}
      onValueChange={onValueChange}
      onValueCommit={onValueCommit}
      controller={controller}
      disabled={disabled}
      required={required}
      readOnly={readOnly}
      name={name}
      form={form}
      space={space}
      format={format}
      gamut={gamut}
      aria-label={props["aria-label"]}
      aria-labelledby={props["aria-labelledby"]}
      style={{ display: "contents" }}
    >
      {swatches}
    </ColorScope>
  );
}
function Swatches({
  size,
  variant,
  layout,
  xstyle,
  style,
  children,
  ...props
}: StyleXProps<Omit<ComponentPropsWithRef<typeof ColorPickerSwatches>, "children">> & {
  children?: ColorScopeProps["children"];
  size: Size;
  variant: "circle" | "square";
  layout: "grid" | "stack" | "palette";
}) {
  const scope = use(ColorValueContext)!;
  const compiled = stylex.props(
    styles.root,
    layout === "stack" && styles.stack,
    layout === "palette" && styles.palette,
    xstyle,
  );
  return (
    <Options
      value={{
        size,
        variant,
        color: scope.color,
        disabled: scope.native.disabled,
        palette: layout === "palette",
      }}
    >
      <ColorPickerSwatches
        {...props}
        {...compiled}
        style={mergeStyle(compiled.style, style)}
        render={slotRender("div", props["data-lenso-slot"] ?? "color-swatch-picker", props.render)}
      >
        {typeof children === "function" ? children(scope) : children}
      </ColorPickerSwatches>
    </Options>
  );
}
export type ColorSwatchPickerItemProps = StyleXProps<
  Omit<
    ComponentPropsWithRef<typeof ColorPickerSwatchItem>,
    "value" | "children" | "style" | "render"
  >
> & {
  render?: RenderProp<ColorSwatchPickerItemRenderProps>;
  color: string | Color;
  isDisabled?: boolean;
  children?: ReactNode | ((state: ColorSwatchPickerItemRenderProps) => ReactNode);
  style?: CSSProperties | ((state: ColorSwatchPickerItemRenderProps) => CSSProperties | undefined);
};
export function ColorSwatchPickerItemPart({
  color,
  children,
  render,
  isDisabled,
  disabled = isDisabled,
  xstyle,
  style,
  ...props
}: ColorSwatchPickerItemProps) {
  const options = use(Options);
  const parsed = typeof color === "string" ? parseColor(color) : color;
  return (
    <ColorPickerSwatchItem
      {...props}
      value={parsed.toString("hexa")}
      disabled={disabled}
      aria-label={props["aria-label"] ?? parsed.toString("hexa")}
      render={(partProps, native) => {
        const state: ColorSwatchPickerItemRenderProps = {
          color: parsed,
          selected: native.selected,
          disabled: !!disabled || native.disabled,
        };
        const compiled = stylex.props(
          styles.item,
          styles[options.size],
          options.variant === "square" && styles.square,
          state.selected && styles.selected,
          state.disabled && styles.disabled,
          options.palette && styles.paletteItem,
          options.palette && state.selected && styles.paletteSelected,
          xstyle,
        );
        return renderElement(
          "button",
          {
            ...partProps,
            ...compiled,
            "data-lenso-slot": props["data-lenso-slot"] ?? "color-swatch-picker-item",
            style: {
              ...(partProps["style"] as CSSProperties),
              ...compiled.style,
              borderColor: state.selected ? parsed.toString("css") : undefined,
              ...(typeof style === "function" ? style(state) : style),
            },
            children: (
              <>
                <span {...stylex.props(styles.srOnly)}>
                  {props["aria-label"] ?? parsed.toString("hexa")}
                </span>
                <ItemState value={state}>
                  {typeof children === "function" ? children(state) : children}
                </ItemState>
              </>
            ),
          },
          render,
          state,
        );
      }}
    />
  );
}
export function ColorSwatchPickerSwatch({ xstyle, color, ...props }: ColorSwatchRootProps) {
  const state = use(ItemState);
  const options = use(Options);
  return (
    <ColorSwatchRoot
      {...props}
      color={color ?? state?.color}
      aria-hidden={props["aria-hidden"] ?? true}
      data-lenso-slot={props["data-lenso-slot"] ?? "color-swatch-picker-swatch"}
      xstyle={[
        styles.swatch,
        state?.selected && !options.palette && styles.selectedSwatch,
        options.palette && styles.paletteSwatch,
        xstyle,
      ]}
    />
  );
}
export type ColorSwatchPickerIndicatorProps = StyleXProps<
  Omit<ComponentPropsWithRef<"span">, "children">
> & { children?: ReactNode | ((state: ColorSwatchPickerItemRenderProps) => ReactNode) };
export function ColorSwatchPickerIndicator({
  children,
  xstyle,
  ...props
}: ColorSwatchPickerIndicatorProps) {
  const state = use(ItemState);
  if (!state) throw new Error("ColorSwatchPicker.Indicator requires ColorSwatchPicker.Item");
  const color = state.color.toFormat("rgb");
  const luminance =
    (0.2126 * color.getChannelValue("red") +
      0.7152 * color.getChannelValue("green") +
      0.0722 * color.getChannelValue("blue")) /
    255;
  const compiled = stylex.props(
    styles.indicator,
    luminance > 0.5 && styles.lightIndicator,
    !state.selected && styles.hidden,
    xstyle,
  );
  return (
    <span
      {...props}
      {...compiled}
      aria-hidden="true"
      data-lenso-slot={props["data-lenso-slot"] ?? "color-swatch-picker-indicator"}
      style={mergeStyle(compiled.style, props.style)}
    >
      {typeof children === "function"
        ? children(state)
        : (children ?? (
            <svg
              width="33%"
              height="33%"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              viewBox="0 0 12 12"
            >
              <polyline points="2.5 6 5 8.5 9.5 3" />
            </svg>
          ))}
    </span>
  );
}
