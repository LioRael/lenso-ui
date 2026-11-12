import * as stylex from "@stylexjs/stylex";
import { colorPickerStyles as s } from "@lenso/tokens/color-picker";
import { materialStyles as m, liquidMaterialStyles as liquid } from "@lenso/tokens/materials";
import {
  controlButtonStyles as buttonStyles,
  controlButtonSizes as buttonSizes,
  controlButtonVariants as buttonVariants,
} from "@lenso/tokens/button";
import { popoverPresentation } from "./popover-presentation.js";
import type { StyleInput } from "./style-types.js";
const native = stylex.create({
  popup: {
    padding: 0,
    boxSizing: "border-box",
    maxHeight: "var(--available-height,calc(100dvh - 24px))",
  },
  content: { position: "relative", zIndex: 1 },
  lens: {
    ":is([data-material-opaque] > *)": { display: "none" },
    "@media (prefers-reduced-transparency: reduce)": { display: "none" },
    "@media (forced-colors: active)": { display: "none" },
  },
});
export const colorPickerKinds = [
  "color-picker",
  "color-picker-trigger",
  "color-picker-popover",
  "color-picker-content",
  "color-picker-dialog",
  "color-picker-lens",
];
export function colorPickerPresentation(kind: string, data: DOMStringMap): StyleInput | undefined {
  if (kind === "color-picker") return [s.root];
  if (kind === "color-picker-trigger")
    return [
      buttonStyles.root,
      buttonSizes.md,
      buttonVariants.glass,
      buttonStyles.material,
      buttonStyles.glass,
    ];
  if (kind === "color-picker-popover")
    return [popoverPresentation("popover-popup", data), s.popover, native.popup];
  if (kind === "color-picker-content") return [s.content, native.content];
  if (kind === "color-picker-dialog") return [s.dialog];
  if (kind === "color-picker-lens") return [m.layer, liquid.small, liquid.medium, native.lens];
  return undefined;
}
