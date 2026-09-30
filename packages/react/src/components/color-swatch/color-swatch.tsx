"use client";
/** HeroUI v3.2.6 derived work. Copyright NextUI Inc. Apache-2.0. Modified for StyleX. */
import { ColorSwatch } from "react-aria-components/ColorSwatch";
import type { ComponentPropsWithRef } from "react";
import { colorSwatchStyles as styles } from "@lenso/tokens/color-swatch";
import type { StyleXProps } from "../../utils/styled.js";
import { racPart } from "../date-input-group/rac-part.js";
export type ColorSwatchRootProps = StyleXProps<ComponentPropsWithRef<typeof ColorSwatch>> & {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  shape?: "circle" | "square";
};
const Root = racPart(ColorSwatch, "color-swatch", () => styles.root);
export function ColorSwatchRoot({
  size = "md",
  shape = "circle",
  xstyle,
  style,
  ...props
}: ColorSwatchRootProps) {
  return (
    <Root
      {...props}
      xstyle={[styles[size], shape === "square" && styles.square, xstyle]}
      style={(state) => ({
        ...state.defaultStyle,
        background: `linear-gradient(${state.color.toString("css")},${state.color.toString("css")}),repeating-conic-gradient(#efefef 0% 25%,#f7f7f7 0% 50%) 50% / 16px 16px`,
        ...(typeof style === "function" ? style(state) : style),
      })}
    />
  );
}
