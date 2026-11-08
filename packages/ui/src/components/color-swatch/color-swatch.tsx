"use client";
// Copyright NextUI Inc. Apache-2.0. Modified for StyleX.
import { use, type CSSProperties, type ReactNode } from "react";
import { useRender } from "@base-ui/react/use-render";
import { mergeProps } from "@base-ui/react/merge-props";
import { parseColor, type Color } from "react-stately/Color";
import * as stylex from "@stylexjs/stylex";
import { colorSwatchStyles as styles } from "@lenso/tokens/color-swatch";
import type { StyleXProps } from "../../utils/styled.js";
import { ColorValueContext } from "../../utils/color-state.js";
export type ColorSwatchState = { color: Color; defaultStyle: CSSProperties };
export type ColorSwatchRootProps = StyleXProps<
  Omit<useRender.ComponentProps<"div", ColorSwatchState>, "children" | "style" | "color">
> & {
  color?: string | Color;
  colorName?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  shape?: "circle" | "square";
  children?: ReactNode | ((state: ColorSwatchState) => ReactNode);
  style?: CSSProperties | ((state: ColorSwatchState) => CSSProperties | undefined);
};
export function ColorSwatchRoot({
  color,
  colorName,
  children,
  render,
  ref,
  size = "md",
  shape = "circle",
  xstyle,
  style,
  ...props
}: ColorSwatchRootProps) {
  const inherited = use(ColorValueContext);
  const value =
    typeof color === "string"
      ? parseColor(color)
      : (color ?? inherited?.color ?? parseColor("#f00"));
  const css = value.toString("css");
  const state: ColorSwatchState = { color: value, defaultStyle: { backgroundColor: css } };
  const compiled = stylex.props(
    styles.root,
    styles[size],
    shape === "square" && styles.square,
    xstyle,
  );
  return useRender({
    defaultTagName: "div",
    render,
    ref,
    state,
    stateAttributesMapping: { color: () => null, defaultStyle: () => null },
    props: mergeProps(compiled, props, {
      role: props.role ?? "img",
      "aria-label": props["aria-label"] ?? colorName ?? value.toString("hexa"),
      "data-slot": props["data-slot"] ?? "color-swatch",
      style: {
        ...compiled.style,
        background: `linear-gradient(${css},${css}),var(--lenso-color-checkerboard) 50% / 16px 16px`,
        ...(typeof style === "function" ? style(state) : style),
      },
      children: typeof children === "function" ? children(state) : children,
    }),
  });
}
