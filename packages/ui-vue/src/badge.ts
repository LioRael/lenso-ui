import {
  badgeStyles,
  badgePrimary,
  badgeSoft,
  badgeColors,
  badgeSizes,
  badgePlacements,
} from "@lenso/tokens/badge";
import { materialStyles } from "@lenso/tokens/materials";
import { htmlPart } from "./parts.js";

export const BadgeRoot = htmlPart<
  "span",
  {
    color?: keyof typeof badgeColors;
    size?: keyof typeof badgeSizes;
    variant?: "primary" | "secondary" | "soft" | "tertiary";
    placement?: keyof typeof badgePlacements;
  }
>(
  "span",
  "badge",
  (props) => [
    materialStyles.root,
    materialStyles.accessible,
    badgeStyles.root,
    badgeSizes[props.size ?? "md"],
    badgeColors[props.color ?? "default"],
    props.variant === "primary" && badgePrimary[props.color ?? "default"],
    props.variant === "soft" && badgeSoft[props.color ?? "default"],
    props.placement && badgePlacements[props.placement],
  ],
  "color",
  "size",
  "variant",
  "placement",
);
export const BadgeLabel = htmlPart("span", "badge-label", () => badgeStyles.label);
export const BadgeAnchor = htmlPart("span", "badge-anchor", () => badgeStyles.anchor);

export const Badge: typeof BadgeRoot & {
  Root: typeof BadgeRoot;
  Label: typeof BadgeLabel;
  Anchor: typeof BadgeAnchor;
} = Object.assign(BadgeRoot, {
  Root: BadgeRoot,
  Label: BadgeLabel,
  Anchor: BadgeAnchor,
});
