import * as stylex from "@stylexjs/stylex";
import {
  autocompleteStyles as s,
  autocompleteSharedStyles as shared,
  autocompleteFieldStyles as field,
} from "@lenso/tokens/autocomplete";
import { comboBoxPresentation } from "./combo-box-presentation.js";
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
  group: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    width: "100%",
    minWidth: 0,
  },
  chipsGroup: { paddingInlineEnd: 52 },
  trigger: { boxSizing: "border-box", width: "100%", textAlign: "start", paddingInlineEnd: 52 },
  compact: {
    position: "absolute",
    insetInlineEnd: 0,
    top: 0,
    bottom: 0,
    width: 24,
    padding: 0,
    borderWidth: 0,
    boxShadow: "none",
    backgroundColor: "transparent",
  },
  clear: { position: "absolute", insetInlineEnd: 28, top: "50%", transform: "translateY(-50%)" },
  chips: { display: "flex", flexWrap: "wrap", flexGrow: 1, minWidth: 0, gap: 6 },
  search: {
    display: "flex",
    alignItems: "center",
    paddingInline: 12,
    paddingBlock: 4,
    flexShrink: 0,
  },
  input: { flexGrow: 1, width: 0, ":is(#exact-root *)": { borderWidth: 0 } },
  searchClear: { width: 20, height: 20, flexShrink: 0, color: "inherit", borderRadius: 10 },
});
const parts = new Map<string, StyleInput>([
  ["autocomplete-input", [s.input, native.input]],
  ["autocomplete-search", [native.search]],
  ["autocomplete-search-clear", [native.searchClear]],
  ["autocomplete-value", [shared.value]],
  ["autocomplete-indicator", [shared.indicator]],
  ["autocomplete-clear", [field.clear, native.clear]],
  ["autocomplete-positioner", [selectPresentation("select-positioner", {}), shared.positioner]],
  ["autocomplete-popover", [s.popover]],
  ["autocomplete-list", [s.list]],
  ["autocomplete-item", [comboBoxPresentation("combo-box-item", {}), shared.item]],
  ["autocomplete-item-text", [shared.itemText]],
  [
    "autocomplete-item-indicator",
    [shared.itemIndicator, comboBoxPresentation("combo-box-item-indicator", {})],
  ],
  ["autocomplete-chips", [field.chips, native.chips]],
  ["autocomplete-chip", [field.chip]],
  ["autocomplete-chip-remove", [field.chipRemove]],
  ["autocomplete-empty", [field.empty, comboBoxPresentation("combo-box-empty", {})]],
  ["autocomplete-separator", [shared.separator, comboBoxPresentation("combo-box-group", {})]],
  ["autocomplete-group-label", [shared.groupLabel]],
]);
export const autocompleteKinds = [
  ...parts.keys(),
  "autocomplete-portal",
  "autocomplete-group",
  "autocomplete-status",
];
export function autocompletePresentation(kind: string, data: DOMStringMap): StyleInput | undefined {
  if (kind === "autocomplete-root")
    return [native.root, data["lensoFullWidth"] === "true" && native.full];
  if (kind === "autocomplete-trigger" || kind === "autocomplete-input-group") {
    const variant = data["lensoVariant"];
    if (variant !== "primary" && variant !== "secondary")
      throw new RangeError(`Unknown Autocomplete variant: ${variant}`);
    const chips = data["lensoChips"] === "true";
    return kind === "autocomplete-trigger"
      ? [
          shared.trigger,
          variant === "secondary" && shared.secondary,
          native.trigger,
          chips && native.compact,
        ]
      : [
          native.group,
          chips && shared.trigger,
          chips && variant === "secondary" && shared.secondary,
          chips && native.chipsGroup,
        ];
  }
  return (
    parts.get(kind) ??
    (kind.startsWith("autocomplete-")
      ? comboBoxPresentation(kind.replace("autocomplete-", "combo-box-"), data)
      : undefined)
  );
}
