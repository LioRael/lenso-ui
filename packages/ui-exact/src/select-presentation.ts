import * as stylex from "@stylexjs/stylex";
import { selectStyles as s } from "@lenso/tokens/select";
import { popupButtonStyles } from "@lenso/tokens/popup-button";
import { menuStyles, menuItemStyles, menuSectionStyles } from "@lenso/tokens/menu";
import { materialStyles, liquidMaterialStyles } from "@lenso/tokens/materials";
import { menuPresentation } from "./menu-presentation.js";
import type { StyleInput } from "./style-types.js";
const native = stylex.create({
  root: { width: "max-content", maxWidth: "100%" },
  full: { width: "100%" },
  contents: { display: "contents" },
  list: { overflowY: "auto", overscrollBehavior: "contain" },
  indicator: { ':is([data-lenso-checked="false"])': { opacity: 0 } },
  hidden: { display: "none" },
  validity: {
    position: "absolute",
    width: 1,
    height: 1,
    padding: 0,
    border: 0,
    clipPath: "inset(50%)",
    overflow: "hidden",
    whiteSpace: "nowrap",
  },
  lens: {
    ":is([data-material-opaque] > *)": { display: "none" },
    "@media (prefers-reduced-transparency: reduce)": { display: "none" },
    "@media (forced-colors: active)": { display: "none" },
  },
});
const parts = new Map<string, StyleInput>([
  ["select-portal", [native.contents]],
  [
    "select-positioner",
    [
      menuPresentation("menu-positioner", {
        lensoSide: "bottom",
        lensoAlign: "start",
        lensoDirection: "ltr",
      }),
      s.positioner,
    ],
  ],
  [
    "select-popover",
    [materialStyles.root, menuStyles.popup, s.popover, s.typography, materialStyles.accessible],
  ],
  ["select-surface", [menuStyles.surface]],
  [
    "select-lens",
    [materialStyles.layer, liquidMaterialStyles.small, liquidMaterialStyles.medium, native.lens],
  ],
  ["select-list", [menuStyles.content, s.list, native.list]],
  ["select-value", [s.value]],
  ["select-indicator", [s.indicator]],
  ["select-item-text", [s.itemText]],
  ["select-item-indicator", [menuItemStyles.indicator, native.indicator]],
  ["select-label", [s.label]],
  ["select-group", []],
  ["select-group-label", [menuSectionStyles.label]],
  ["select-separator", [menuStyles.separator]],
  ["select-reset", [native.hidden]],
  ["select-form", [native.hidden]],
  ["select-validity", [native.validity]],
]);
export const selectKinds = [...parts.keys()];
export function selectPresentation(kind: string, data: DOMStringMap): StyleInput | undefined {
  if (kind === "select-root")
    return [native.root, data["lensoFullWidth"] === "true" && native.full];
  if (kind === "select-trigger" || kind === "select-item") {
    if (data["lensoVariant"] !== "primary" && data["lensoVariant"] !== "secondary")
      throw new RangeError(`Unknown Select variant: ${data["lensoVariant"]}`);
    if (kind === "select-item")
      return [menuItemStyles.root, s.item, data["lensoVariant"] === "primary" && s.primaryItem];
    return [
      popupButtonStyles.root,
      s.validation,
      data["lensoVariant"] === "secondary" && s.secondary,
      data["lensoFullWidth"] === "true" && s.fullWidth,
    ];
  }
  return parts.get(kind);
}
