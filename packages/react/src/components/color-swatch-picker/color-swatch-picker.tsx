"use client";
/** HeroUI v3.2.6 derived work. Copyright NextUI Inc. Apache-2.0. Modified for StyleX. */
import { createContext, use, type ComponentPropsWithRef, type ReactNode } from "react";
import {
  ColorSwatchPicker,
  ColorSwatchPickerItem,
  ColorSwatch,
  type ColorSwatchPickerItemRenderProps,
} from "react-aria-components/ColorSwatchPicker";
import * as stylex from "@stylexjs/stylex";
import { colorSwatchPickerStyles as styles } from "@lenso/tokens/color-swatch-picker";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";
import { racPart } from "../date-input-group/rac-part.js";
type Size = "xs" | "sm" | "md" | "lg" | "xl";
const Options = createContext<{ size: Size; variant: "circle" | "square" }>({
  size: "md",
  variant: "circle",
});
const ItemState = createContext<ColorSwatchPickerItemRenderProps | null>(null);
export type ColorSwatchPickerRootProps = StyleXProps<
  ComponentPropsWithRef<typeof ColorSwatchPicker>
> & { size?: Size; variant?: "circle" | "square"; layout?: "grid" | "stack" };
export function ColorSwatchPickerRoot({
  size = "md",
  variant = "circle",
  layout = "grid",
  xstyle,
  style,
  ...props
}: ColorSwatchPickerRootProps) {
  const compiled = stylex.props(styles.root, layout === "stack" && styles.stack, xstyle);
  return (
    <Options value={{ size, variant }}>
      <ColorSwatchPicker
        {...props}
        {...compiled}
        data-slot={props["data-slot"] ?? "color-swatch-picker"}
        layout={layout}
        style={mergeStyle(compiled.style, style)}
      />
    </Options>
  );
}
const Item = racPart(
  ColorSwatchPickerItem,
  "color-swatch-picker-item",
  (state: ColorSwatchPickerItemRenderProps) => [
    styles.item,
    state.isSelected && styles.selected,
    state.isFocusVisible && styles.focused,
    state.isDisabled && styles.disabled,
  ],
);
export function ColorSwatchPickerItemPart({
  children,
  xstyle,
  style,
  ...props
}: StyleXProps<ComponentPropsWithRef<typeof ColorSwatchPickerItem>>) {
  const { size, variant } = use(Options);
  return (
    <Item
      {...props}
      xstyle={[styles[size], variant === "square" && styles.square, xstyle]}
      style={(state) => ({
        borderColor: state.isSelected ? state.color.toString("css") : undefined,
        ...(typeof style === "function" ? style(state) : style),
      })}
    >
      {(state) => (
        <ItemState value={state}>
          {typeof children === "function" ? children(state) : children}
        </ItemState>
      )}
    </Item>
  );
}
const Swatch = racPart(ColorSwatch, "color-swatch-picker-swatch", () => styles.swatch);
export function ColorSwatchPickerSwatch(
  props: StyleXProps<ComponentPropsWithRef<typeof ColorSwatch>>,
) {
  const state = use(ItemState);
  return <Swatch {...props} xstyle={[state?.isSelected && styles.selectedSwatch, props.xstyle]} />;
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
