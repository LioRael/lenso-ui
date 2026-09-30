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
import { styledPart, type StyleXProps } from "../../utils/styled.js";
const Root = styledPart("span", "chip", chipStyles.root);
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
  ...props
}: ChipRootProps) {
  return (
    <Root
      {...props}
      xstyle={[
        chipSizes[size],
        chipColors[color],
        variant === "primary" && chipPrimary[color],
        variant === "soft" && chipSoft[color],
        variant === "tertiary" && chipVariants.tertiary,
        xstyle,
      ]}
    />
  );
}
export const ChipLabel = styledPart("span", "chip-label", chipStyles.label);
export const Chip = Object.assign(ChipRoot, { Root: ChipRoot, Label: ChipLabel });
export type ChipProps = ChipRootProps;
export type ChipLabelProps = ComponentProps<typeof ChipLabel>;
export type Chip = { Props: ChipProps; RootProps: ChipRootProps; LabelProps: ChipLabelProps };
