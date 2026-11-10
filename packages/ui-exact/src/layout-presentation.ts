import * as stylex from "@stylexjs/stylex";
import type { StyleInput } from "./style-types.js";
import { cardStyles, cardVariants } from "@lenso/tokens/card";
import { emptyStateStyles } from "@lenso/tokens/empty-state";
import { materialStyles, liquidMaterialStyles } from "@lenso/tokens/materials";

const native = stylex.create({
  box: { boxSizing: "border-box", minWidth: 0 },
  text: { margin: 0, minWidth: 0, maxWidth: "100%", overflowWrap: "anywhere" },
  lens: {
    ":is([data-material-opaque] > *)": { display: "none" },
    "@media (prefers-reduced-transparency: reduce)": { display: "none" },
    "@media (forced-colors: active)": { display: "none" },
  },
});
const parts = new Map<string, StyleInput>([
  ["card-header", [cardStyles.header, native.box]],
  ["card-title", [cardStyles.title, native.text]],
  ["card-description", [cardStyles.description, native.text]],
  ["card-content", [cardStyles.content, native.box]],
  ["card-footer", [cardStyles.footer]],
  [
    "card-lens",
    [materialStyles.layer, liquidMaterialStyles.small, liquidMaterialStyles.medium, native.lens],
  ],
  ["empty-state", [emptyStateStyles.root]],
  ["empty-state-content", [emptyStateStyles.content]],
  ["empty-state-message", [emptyStateStyles.message]],
  ["empty-state-title", [emptyStateStyles.title]],
  ["empty-state-description", [emptyStateStyles.description]],
  ["empty-state-actions", [emptyStateStyles.actions]],
]);
export const layoutKinds = [...parts.keys()];
export function layoutPresentation(kind: string, data: DOMStringMap): StyleInput | undefined {
  if (kind === "card") {
    const variant = data["lensoVariant"];
    if (
      variant !== "default" &&
      variant !== "secondary" &&
      variant !== "tertiary" &&
      variant !== "transparent" &&
      variant !== "glass"
    )
      throw new RangeError(`Unknown Lenso Card variant: ${variant}`);
    return [
      native.box,
      variant === "glass" && materialStyles.root,
      cardStyles.root,
      cardVariants[variant],
      variant === "glass" && materialStyles.accessible,
    ];
  }
  if (kind === "empty-state-icon") {
    const variant = data["variant"];
    if (variant !== "symbol" && variant !== "circle")
      throw new RangeError(`Unknown Lenso EmptyState icon: ${variant}`);
    return [emptyStateStyles.icon, variant === "circle" && emptyStateStyles.circle];
  }
  return parts.get(kind);
}
