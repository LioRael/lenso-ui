import type { StyleInput } from "./style-types.js";
import * as stylex from "@stylexjs/stylex";
import { linkStyles } from "@lenso/tokens/link";
import { breadcrumbsStyles } from "@lenso/tokens/breadcrumbs";
import { separatorStyles, separatorVariants } from "@lenso/tokens/separator";

// Exact's CSS direction does not change HTML :dir(). Keep the arrow tied to
// the explicit direction that also controls the breadcrumb layout before hatch.
const directionStyles = stylex.create({
  separator: {
    transform: {
      default: "none",
      ':is([data-slot="breadcrumbs-nav"][data-lenso-direction="rtl"] *)': "rotate(180deg)",
    },
  },
});

const presentations = new Map<string, StyleInput>([
  ["link", [linkStyles.root]],
  ["link-icon", [linkStyles.icon]],
  ["link-arrow", [linkStyles.icon, linkStyles.defaultIcon]],
  ["breadcrumbs", [breadcrumbsStyles.root]],
  ["breadcrumbs-item", [breadcrumbsStyles.item]],
  ["breadcrumbs-separator", [breadcrumbsStyles.separator, directionStyles.separator]],
  ["breadcrumbs-chevron", [breadcrumbsStyles.separator, directionStyles.separator]],
]);

export function navigationPresentation(kind: string, data: DOMStringMap) {
  if (kind === "breadcrumbs-link")
    return [
      linkStyles.root,
      breadcrumbsStyles.link,
      data["lensoCurrent"] === "true" && breadcrumbsStyles.current,
    ];
  if (kind === "separator") {
    const orientation = data["orientation"];
    const variant = data["lensoVariant"];
    if (orientation !== "horizontal" && orientation !== "vertical")
      throw new RangeError(`Unknown Lenso Separator orientation: ${orientation}`);
    if (variant !== "default" && variant !== "secondary" && variant !== "tertiary")
      throw new RangeError(`Unknown Lenso Separator variant: ${variant}`);
    return [separatorStyles.root, separatorStyles[orientation], separatorVariants[variant]];
  }
  return presentations.get(kind);
}

export const navigationKinds = [...presentations.keys()];
