import * as stylex from "@stylexjs/stylex";
import { segmentedControlStyles as s } from "@lenso/tokens/segmented-control";
import { tabsStyles } from "@lenso/tokens/tabs";
import { tabsPresentation } from "./tabs-presentation.js";
import type { StyleInput } from "./style-types.js";
const native = stylex.create({
  labelText: { display: "inline", whiteSpace: "nowrap" },
  input: {
    position: "absolute",
    width: 1,
    height: 1,
    padding: 0,
    margin: -1,
    borderWidth: 0,
    overflow: "hidden",
    clipPath: "inset(50%)",
    whiteSpace: "nowrap",
  },
});
export const segmentedKinds = [
  "segmented-control-item",
  "segmented-control-label",
  "segmented-control-label-text",
  "segmented-control-empty",
  "segmented-control-input",
  "segmented-control-indicator",
];
export function segmentedPresentation(kind: string, data: DOMStringMap): StyleInput | undefined {
  if (kind === "segmented-control")
    return [tabsPresentation("tabs-list", { ...data, orientation: "horizontal" }), s.root];
  if (kind === "segmented-control-item")
    return [
      tabsPresentation("tabs-tab", { ...data, lensoAlign: "center", orientation: "horizontal" }),
      s.item,
    ];
  if (kind === "segmented-control-label") return [s.face];
  if (kind === "segmented-control-label-text") return [native.labelText];
  if (kind === "segmented-control-empty") return [s.empty];
  if (kind === "segmented-control-input") return [native.input];
  if (kind === "segmented-control-indicator")
    return [tabsPresentation("tabs-indicator", data), tabsStyles.fallback];
  return undefined;
}
