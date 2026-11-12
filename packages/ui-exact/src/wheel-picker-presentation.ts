import * as stylex from "@stylexjs/stylex";
import { wheelPickerStyles as w } from "@lenso/tokens/wheel-picker";
import { listBoxPresentation } from "./list-box-presentation.js";
const native = stylex.create({ hidden: { display: "none" } });
export const wheelPickerKinds = [
  "wheel-picker-band",
  "wheel-picker-label",
  "wheel-picker-empty",
  "wheel-picker-form",
];
export function wheelPickerPresentation(kind: string, data: DOMStringMap) {
  if (kind === "wheel-picker") return [w.root, data["lensoDisabled"] === "true" && w.disabled];
  if (kind === "wheel-picker-viewport")
    return [
      listBoxPresentation("list-box", data),
      w.viewport,
      data["lensoDisabled"] === "true" && w.disabledViewport,
    ];
  if (kind === "wheel-picker-option") return [listBoxPresentation("list-box-item", data), w.option];
  if (kind === "wheel-picker-band") return [w.band];
  if (kind === "wheel-picker-label") return [w.label];
  if (kind === "wheel-picker-empty") return [w.empty];
  if (kind === "wheel-picker-form") return [native.hidden];
}
