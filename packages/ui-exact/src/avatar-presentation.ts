import * as stylex from "@stylexjs/stylex";
import {
  avatarStyles,
  avatarSizes,
  avatarFallbackSizes,
  avatarColors,
  avatarSoft,
} from "@lenso/tokens/avatar";
import { avatarGroupStyles } from "@lenso/tokens/avatar-group";
import type { StyleInput } from "./style-types.js";

const native = stylex.create({
  fallback: { ":is([data-lenso-image-loaded] > *)": { visibility: "hidden" } },
  image: { opacity: { default: 0, ":is([data-lenso-image-loaded] > *)": 1 } },
});
export function avatarPresentation(kind: string, data: DOMStringMap): StyleInput | undefined {
  if (kind === "avatar-image") return [avatarStyles.image, native.image];
  if (kind === "avatar-group")
    return [avatarGroupStyles.root, data["lensoGrid"] === "true" && avatarGroupStyles.grid];
  if (kind === "avatar-group-item")
    return [
      avatarStyles.root,
      avatarGroupStyles.count,
      data["lensoSize"] === "sm" && avatarSizes.sm,
      data["lensoSize"] === "lg" && avatarSizes.lg,
      data["lensoOverlap"] === "true" && avatarGroupStyles.overlap,
      data["lensoRing"] === "true" && avatarGroupStyles.ring,
      data["lensoClipped"] === "true" && avatarGroupStyles.clip,
    ];
  if (kind !== "avatar" && kind !== "avatar-fallback") return undefined;
  const size = data["lensoSize"];
  const color = data["lensoColor"];
  const variant = data["lensoVariant"];
  if (size !== "sm" && size !== "md" && size !== "lg")
    throw new RangeError(`Unknown Avatar size: ${size}`);
  if (
    color !== "default" &&
    color !== "accent" &&
    color !== "success" &&
    color !== "warning" &&
    color !== "danger"
  )
    throw new RangeError(`Unknown Avatar color: ${color}`);
  if (variant !== "default" && variant !== "soft")
    throw new RangeError(`Unknown Avatar variant: ${variant}`);
  return kind === "avatar"
    ? [avatarStyles.root, avatarSizes[size], variant === "soft" && avatarStyles.soft]
    : [
        avatarStyles.fallback,
        avatarFallbackSizes[size],
        avatarColors[color],
        variant === "soft" && avatarSoft[color],
        data["lensoClipped"] === "true" && avatarStyles.clippedFallback,
        native.fallback,
      ];
}
