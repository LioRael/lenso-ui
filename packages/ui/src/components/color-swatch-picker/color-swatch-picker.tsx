"use client";
// Copyright NextUI Inc. Apache-2.0. Modified: Base UI radio selection and native form behavior.
import {
  createContext,
  use,
  useState,
  type ComponentPropsWithRef,
  type ReactNode,
  type CSSProperties,
} from "react";
import { RadioGroup } from "@base-ui/react/radio-group";
import { Radio } from "@base-ui/react/radio";
import { parseColor, type Color } from "react-stately/Color";
import type { ColorPickerProps } from "react-stately/useColorPickerState";
import * as stylex from "@stylexjs/stylex";
import { colorSwatchPickerStyles as styles } from "@lenso/tokens/color-swatch-picker";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";
import { useColorValue } from "../../utils/color-state.js";
import { ColorSwatchRoot, type ColorSwatchRootProps } from "../color-swatch/color-swatch.js";
type Size = "xs" | "sm" | "md" | "lg" | "xl";
export interface ColorSwatchPickerItemRenderProps {
  color: Color;
  isSelected: boolean;
  isDisabled: boolean;
  isFocusVisible: boolean;
}
const Options = createContext<{
  size: Size;
  variant: "circle" | "square";
  color: Color | null;
  disabled: boolean;
  palette: boolean;
}>({ size: "md", variant: "circle", color: null, disabled: false, palette: false });
const ItemState = createContext<ColorSwatchPickerItemRenderProps | null>(null);
export type ColorSwatchPickerRootProps = StyleXProps<
  Omit<ComponentPropsWithRef<typeof RadioGroup<string>>, "value" | "defaultValue" | "onChange">
> &
  ColorPickerProps & {
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
  onValueChange,
  isDisabled,
  disabled = isDisabled,
  xstyle,
  style,
  ...props
}: ColorSwatchPickerRootProps) {
  const state = useColorValue({ value, defaultValue, onChange });
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
        color: state.color,
        disabled: !!disabled,
        palette: layout === "palette",
      }}
    >
      <RadioGroup<string>
        {...props}
        {...compiled}
        disabled={disabled}
        value={state.color.toString("hexa")}
        onValueChange={(color, details) => {
          onValueChange?.(color, details);
          if (!details.isCanceled) state.setColor(parseColor(color));
        }}
        data-slot={props["data-slot"] ?? "color-swatch-picker"}
        style={mergeStyle(compiled.style, style)}
      />
    </Options>
  );
}
export type ColorSwatchPickerItemProps = StyleXProps<
  Omit<ComponentPropsWithRef<typeof Radio.Root<string>>, "value" | "children" | "style">
> & {
  color: string | Color;
  isDisabled?: boolean;
  children?: ReactNode | ((state: ColorSwatchPickerItemRenderProps) => ReactNode);
  style?: CSSProperties | ((state: ColorSwatchPickerItemRenderProps) => CSSProperties | undefined);
};
export function ColorSwatchPickerItemPart({
  color,
  children,
  isDisabled,
  disabled = isDisabled,
  xstyle,
  style,
  onFocus,
  onBlur,
  ...props
}: ColorSwatchPickerItemProps) {
  const options = use(Options);
  const [focused, setFocused] = useState(false);
  const parsed = typeof color === "string" ? parseColor(color) : color;
  const state: ColorSwatchPickerItemRenderProps = {
    color: parsed,
    isSelected: parsed.toString("hexa") === options.color?.toString("hexa"),
    isDisabled: !!disabled || options.disabled,
    isFocusVisible: focused,
  };
  const compiled = stylex.props(
    styles.item,
    styles[options.size],
    options.variant === "square" && styles.square,
    state.isSelected && styles.selected,
    state.isDisabled && styles.disabled,
    options.palette && styles.paletteItem,
    options.palette && state.isSelected && styles.paletteSelected,
    xstyle,
  );
  return (
    <Radio.Root<string>
      {...props}
      {...compiled}
      value={parsed.toString("hexa")}
      disabled={disabled}
      aria-label={props["aria-label"] ?? parsed.toString("hexa")}
      onFocus={(event) => {
        onFocus?.(event);
        setFocused(event.currentTarget.matches(":focus-visible"));
      }}
      onBlur={(event) => {
        onBlur?.(event);
        setFocused(false);
      }}
      data-slot={props["data-slot"] ?? "color-swatch-picker-item"}
      style={{
        ...compiled.style,
        borderColor: state.isSelected ? parsed.toString("css") : undefined,
        ...(typeof style === "function" ? style(state) : style),
      }}
    >
      <ItemState value={state}>
        {typeof children === "function" ? children(state) : children}
      </ItemState>
    </Radio.Root>
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
      data-slot={props["data-slot"] ?? "color-swatch-picker-swatch"}
      xstyle={[
        styles.swatch,
        state?.isSelected && !options.palette && styles.selectedSwatch,
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
    !state.isSelected && styles.hidden,
    xstyle,
  );
  return (
    <span
      {...props}
      {...compiled}
      aria-hidden="true"
      data-slot={props["data-slot"] ?? "color-swatch-picker-indicator"}
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
