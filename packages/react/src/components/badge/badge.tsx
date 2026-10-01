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
import * as stylex from "@stylexjs/stylex";
import { type StyleXProps } from "../../utils/styled.js";
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
  style,
  ...props
}: BadgeRootProps) {
  const compiled = stylex.props(
    badgeStyles.root,
    badgeSizes[size],
    badgeColors[color],
    variant === "primary" && badgePrimary[color],
    variant === "soft" && badgeSoft[color],
    placement && badgePlacements[placement],
    xstyle,
  );
  return (
    <span
      {...props}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "badge"}
      {...compiled}
      style={{ ...compiled.style, ...style }}
    />
  );
}
export function BadgeLabel({ xstyle, style, ...props }: StyleXProps<ComponentProps<"span">>) {
  const compiled = stylex.props(badgeStyles.label, xstyle);
  return (
    <span
      {...props}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "badge-label"}
      {...compiled}
      style={{ ...compiled.style, ...style }}
    />
  );
}
export function BadgeAnchor({ xstyle, style, ...props }: StyleXProps<ComponentProps<"span">>) {
  const compiled = stylex.props(badgeStyles.anchor, xstyle);
  return (
    <span
      {...props}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "badge-anchor"}
      {...compiled}
      style={{ ...compiled.style, ...style }}
    />
  );
}
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
