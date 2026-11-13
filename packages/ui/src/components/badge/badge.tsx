"use client";
// modified for native HTML and StyleX.
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
import { materialStyles } from "@lenso/tokens/materials";
import { MaterialBackground } from "../../utils/materials/render.js";
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
  children,
  ...props
}: BadgeRootProps) {
  const compiled = stylex.props(
    materialStyles.root,
    materialStyles.accessible,
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
      data-lenso-slot={(props as { "data-lenso-slot"?: string })["data-lenso-slot"] ?? "badge"}
      {...compiled}
      style={{ ...compiled.style, ...style }}
      data-material="glass-small"
    >
      <MaterialBackground variant="glass-small" />
      {children}
    </span>
  );
}
export function BadgeLabel({ xstyle, style, ...props }: StyleXProps<ComponentProps<"span">>) {
  const compiled = stylex.props(badgeStyles.label, xstyle);
  return (
    <span
      {...props}
      data-lenso-slot={
        (props as { "data-lenso-slot"?: string })["data-lenso-slot"] ?? "badge-label"
      }
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
      data-lenso-slot={
        (props as { "data-lenso-slot"?: string })["data-lenso-slot"] ?? "badge-anchor"
      }
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
