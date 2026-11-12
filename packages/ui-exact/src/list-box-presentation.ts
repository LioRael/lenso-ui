import * as stylex from "@stylexjs/stylex";
import {
  listBoxStyles as root,
  listBoxItemStyles as item,
  listBoxSectionStyles as section,
  listBoxSectionLabelStyles as label,
} from "@lenso/tokens/list-box";
import type { StyleInput } from "./style-types.js";
const native = stylex.create({
  root: { boxSizing: "border-box", minWidth: 0 },
  indicator: { opacity: { default: 0, ':is([data-lenso-checked="true"])': 1 } },
  request: { display: "none" },
});
export const listBoxKinds = [
  "list-box",
  "list-box-section",
  "list-box-section-label",
  "list-box-request",
];
export function listBoxPresentation(kind: string, data: DOMStringMap): StyleInput | undefined {
  if (kind === "list-box") return [root.root, native.root];
  if (kind === "list-box-section") return [section.root];
  if (kind === "list-box-section-label") return [label.root];
  if (kind === "list-box-request") return [native.request];
  if (kind !== "list-box-item" && kind !== "list-box-indicator") return undefined;
  const variant = data["lensoVariant"];
  if (variant !== "default" && variant !== "danger")
    throw new RangeError(`Unknown ListBox item variant: ${variant}`);
  if (kind === "list-box-indicator")
    return [item.indicator, native.indicator, variant === "danger" && item.indicatorDanger];
  return [
    item.root,
    variant === "danger" && item.danger,
    data["lensoDisabled"] === "true" && item.disabled,
  ];
}
