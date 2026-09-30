"use client";
// Derived from HeroUI v3.2.6 (Apache-2.0); modified for native HTML and StyleX.
import type { ComponentProps } from "react";
import {
  badgeStyles,
  badgeSizes,
  badgePlacements,
  badgeColors,
  badgePrimary,
  badgeSoft,
} from "@lenso/tokens/badge";
import { styledPart, type StyleXProps } from "../../utils/styled.js";
const Root = styledPart("span", "badge", badgeStyles.root);
export type BadgeRootProps = StyleXProps<ComponentProps<"span">> & {
  size?: keyof typeof badgeSizes;
  color?: keyof typeof badgeColors;
  variant?: "primary" | "secondary" | "soft";
  placement?: keyof typeof badgePlacements;
};
export function BadgeRoot({
  size = "md",
  color = "default",
  variant = "primary",
  placement = "top-right",
  xstyle,
  ...props
}: BadgeRootProps) {
  return (
    <Root
      {...props}
      xstyle={[
        badgeSizes[size],
        badgeColors[color],
        variant === "primary" && badgePrimary[color],
        variant === "soft" && badgeSoft[color],
        placement && badgePlacements[placement],
        xstyle,
      ]}
    />
  );
}
export const BadgeLabel = styledPart("span", "badge-label", badgeStyles.label);
export const BadgeAnchor = styledPart("span", "badge-anchor", badgeStyles.anchor);
export const Badge = Object.assign(BadgeRoot, {
  Root: BadgeRoot,
  Label: BadgeLabel,
  Anchor: BadgeAnchor,
});
export type BadgeProps = BadgeRootProps;
export type BadgeLabelProps = ComponentProps<typeof BadgeLabel>;
export type BadgeAnchorProps = ComponentProps<typeof BadgeAnchor>;
export type Badge = {
  Props: BadgeProps;
  RootProps: BadgeRootProps;
  LabelProps: BadgeLabelProps;
  AnchorProps: BadgeAnchorProps;
};
