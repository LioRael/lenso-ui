import * as stylex from "@stylexjs/stylex";
import type { StyleInput } from "./style-types.js";
import { alertStyles, alertColors } from "@lenso/tokens/alert";
import {
  badgeStyles,
  badgeSizes,
  badgePlacements,
  badgeColors,
  badgePrimary,
  badgeSoft,
} from "@lenso/tokens/badge";
import {
  chipStyles,
  chipSizes,
  chipColors,
  chipPrimary,
  chipSoft,
  chipVariants,
} from "@lenso/tokens/chip";
import { closeButtonStyles } from "@lenso/tokens/close-button";
import { buttonStyles, buttonSizes, buttonVariants } from "@lenso/tokens/button";
import { materialStyles, liquidMaterialStyles } from "@lenso/tokens/materials";

const native = stylex.create({
  box: { boxSizing: "border-box" },
  content: { minWidth: 0, overflowWrap: "anywhere" },
  loading: { transform: { default: "none", ":active": "none" } },
  lens: {
    ":is([data-material-opaque] > *)": { display: "none" },
    "@media (prefers-reduced-transparency: reduce)": { display: "none" },
    "@media (forced-colors: active)": { display: "none" },
  },
});
const colors = ["default", "accent", "success", "warning", "danger"] as const;
function colorOf(value: string | undefined) {
  if (!colors.includes(value as (typeof colors)[number]))
    throw new RangeError(`Unknown Lenso content color: ${value}`);
  return value as (typeof colors)[number];
}
const parts = new Map<string, StyleInput>([
  ["alert-content", [alertStyles.content, native.content]],
  ["alert-description", [alertStyles.description]],
  ["alert-icon", [alertStyles.icon]],
  [
    "alert-lens",
    [materialStyles.layer, liquidMaterialStyles.small, liquidMaterialStyles.medium, native.lens],
  ],
  ["badge-lens", [materialStyles.layer, liquidMaterialStyles.small, native.lens]],
  ["badge-label", [badgeStyles.label]],
  ["badge-anchor", [badgeStyles.anchor]],
  ["chip-label", [chipStyles.label]],
  ["close-button-icon", [closeButtonStyles.icon]],
]);
export const contentKinds = [...parts.keys()];
export function contentPresentation(kind: string, data: DOMStringMap): StyleInput | undefined {
  if (kind === "alert" || kind === "alert-title" || kind === "alert-indicator") {
    const color = colorOf(data["lensoColor"]);
    if (kind === "alert")
      return [native.box, materialStyles.root, alertStyles.root, materialStyles.accessible];
    return [kind === "alert-title" ? alertStyles.title : alertStyles.indicator, alertColors[color]];
  }
  if (kind === "chip" || kind === "badge") {
    const size = data["lensoSize"];
    if (size !== "sm" && size !== "md" && size !== "lg")
      throw new RangeError(`Unknown Lenso content size: ${size}`);
    const color = colorOf(data["lensoColor"]);
    const variant = data["lensoVariant"];
    if (
      variant !== "primary" &&
      variant !== "secondary" &&
      variant !== "soft" &&
      !(kind === "chip" && variant === "tertiary")
    )
      throw new RangeError(`Unknown Lenso ${kind} variant: ${variant}`);
    if (kind === "chip")
      return [
        chipStyles.root,
        chipSizes[size],
        chipColors[color],
        variant === "primary" && chipPrimary[color],
        variant === "soft" && chipSoft[color],
        variant === "tertiary" && chipVariants.tertiary,
      ];
    const placement = data["placement"];
    if (
      placement !== "top-left" &&
      placement !== "top-right" &&
      placement !== "bottom-left" &&
      placement !== "bottom-right"
    )
      throw new RangeError(`Unknown Lenso Badge placement: ${placement}`);
    return [
      native.box,
      materialStyles.root,
      materialStyles.accessible,
      badgeStyles.root,
      badgeSizes[size],
      badgeColors[color],
      variant === "primary" && badgePrimary[color],
      variant === "soft" && badgeSoft[color],
      badgePlacements[placement],
    ];
  }
  if (kind === "close-button") {
    for (const key of ["lensoLoading", "lensoDestructive"])
      if (data[key] !== "true" && data[key] !== "false")
        throw new RangeError(`Unknown Lenso CloseButton ${key}: ${data[key]}`);
    return [
      buttonStyles.root,
      buttonSizes.md,
      buttonStyles.tracking,
      data["lensoDestructive"] === "true" && buttonStyles.destructiveTracking,
      buttonVariants.bordered,
      data["lensoDestructive"] === "true" && buttonStyles.destructive,
      closeButtonStyles.root,
      data["lensoLoading"] === "true" && buttonStyles.pending,
      data["lensoLoading"] === "true" && native.loading,
    ];
  }
  return parts.get(kind);
}
