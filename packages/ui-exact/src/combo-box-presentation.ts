import * as stylex from "@stylexjs/stylex";
import { comboBoxStyles as s, comboBoxSharedStyles as shared } from "@lenso/tokens/combo-box";
import { inputGroupMaterialStyles } from "@lenso/tokens/input-group";
import { glassStyles } from "@lenso/tokens/glass";
import { selectPresentation } from "./select-presentation.js";
import type { StyleInput } from "./style-types.js";
const native = stylex.create({
  root: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    width: "max-content",
    maxWidth: "100%",
    minWidth: 0,
  },
  full: { width: "100%" },
  contents: { display: "contents" },
  row: {
    display: { default: "flex", ":is([hidden])": "none" },
    boxSizing: "border-box",
    textAlign: "start",
  },
  group: { display: { default: "block", ":is([hidden])": "none" } },
  empty: { display: { default: "block", ":is([hidden])": "none" } },
  indicator: { display: { default: "none", ':is([data-lenso-checked="true"])': "flex" } },
  status: {
    position: "absolute",
    width: 1,
    height: 1,
    padding: 0,
    border: 0,
    clipPath: "inset(50%)",
    overflow: "hidden",
    whiteSpace: "nowrap",
  },
});
const parts = new Map<string, StyleInput>([
  ["combo-box-trigger", [s.trigger, s.groupedTrigger]],
  ["combo-box-indicator", [s.icon]],
  ["combo-box-clear", [s.clear]],
  ["combo-box-portal", [native.contents]],
  ["combo-box-positioner", [selectPresentation("select-positioner", {}), shared.positioner]],
  ["combo-box-popover", [shared.popover]],
  ["combo-box-list", [shared.list]],
  ["combo-box-item", [shared.item, native.row]],
  ["combo-box-item-text", [shared.itemText]],
  ["combo-box-item-indicator", [shared.itemIndicator, native.indicator]],
  ["combo-box-group", [native.group]],
  ["combo-box-group-label", [shared.groupLabel]],
  ["combo-box-separator", [shared.separator, native.group]],
  ["combo-box-empty", [s.empty, native.empty]],
  ["combo-box-status", [native.status]],
  ["combo-box-chips", [s.chips]],
  ["combo-box-chip", [s.chip]],
  ["combo-box-chip-remove", [s.chipRemove]],
]);
export const comboBoxKinds = [...parts.keys()];
export function comboBoxPresentation(kind: string, data: DOMStringMap): StyleInput | undefined {
  if (kind === "combo-box-root")
    return [native.root, data["lensoFullWidth"] === "true" && native.full];
  if (kind !== "combo-box-input-group" && kind !== "combo-box-input") return parts.get(kind);
  const variant = data["lensoVariant"];
  if (variant !== "primary" && variant !== "secondary")
    throw new RangeError(`Unknown ComboBox variant: ${variant}`);
  if (kind === "combo-box-input") return [s.input, s.groupedInput, inputGroupMaterialStyles.input];
  return [
    s.inputGroup,
    s.field,
    glassStyles.optics,
    inputGroupMaterialStyles.root,
    variant === "secondary" && inputGroupMaterialStyles.secondary,
    data["lensoFullWidth"] === "true" && inputGroupMaterialStyles.fullWidth,
  ];
}
