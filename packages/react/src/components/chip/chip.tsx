"use client";
// Derived from HeroUI v3.2.6 (Apache-2.0); modified for native HTML and StyleX.
import type { ComponentProps } from "react";
import {
  chipStyles,
  chipSizes,
  chipColors,
  chipPrimary,
  chipSoft,
  chipVariants,
} from "@lenso/tokens/chip";
import * as stylex from "@stylexjs/stylex";
import { type StyleXProps } from "../../utils/styled.js";
export type ChipRootProps = StyleXProps<ComponentProps<"span">> & {
  size?: keyof typeof chipSizes;
  color?: keyof typeof chipColors;
  variant?: "primary" | "secondary" | "tertiary" | "soft";
};
export function ChipRoot({
  size = "md",
  color = "default",
  variant = "secondary",
  xstyle,
  style,
  ...props
}: ChipRootProps) {
  const compiled = stylex.props(
    chipStyles.root,
    chipSizes[size],
    chipColors[color],
    variant === "primary" && chipPrimary[color],
    variant === "soft" && chipSoft[color],
    variant === "tertiary" && chipVariants.tertiary,
    xstyle,
  );
  return (
    <span
      {...props}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "chip"}
      {...compiled}
      style={{ ...compiled.style, ...style }}
    />
  );
}
export function ChipLabel({ xstyle, style, ...props }: StyleXProps<ComponentProps<"span">>) {
  const compiled = stylex.props(chipStyles.label, xstyle);
  return (
    <span
      {...props}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "chip-label"}
      {...compiled}
      style={{ ...compiled.style, ...style }}
    />
  );
}
export const Chip = Object.assign(ChipRoot, { Root: ChipRoot, Label: ChipLabel });
export type ChipProps = ChipRootProps;
export type ChipLabelProps = ComponentProps<typeof ChipLabel>;
export type Chip = { Props: ChipProps; RootProps: ChipRootProps; LabelProps: ChipLabelProps };
