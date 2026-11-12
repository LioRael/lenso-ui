import * as stylex from "@stylexjs/stylex";
import { colorFieldStyles as field } from "@lenso/tokens/color-field";
import { colorInputGroupStyles as group } from "@lenso/tokens/color-input-group";
import { inputGroupMaterialStyles } from "@lenso/tokens/input-group";
import type { StyleInput } from "./style-types.js";
const native = stylex.create({
  input: {
    height: "100%",
    minHeight: 0,
    maxWidth: "none",
    borderRadius: 0,
    padding: 0,
    lineHeight: "20px",
    boxShadow: "none",
  },
});
export const colorFieldKinds = [
  "color-field-input",
  "color-field-description",
  "color-field-error",
  "color-request",
  "color-input-prefix",
  "color-input-suffix",
];
export function colorFieldPresentation(kind: string, data: DOMStringMap): StyleInput | undefined {
  if (kind === "color-field")
    return [field.root, data["lensoFullWidth"] === "true" && field.fullWidth];
  if (kind === "color-input-group") {
    if (!["primary", "secondary"].includes(data["lensoVariant"] ?? ""))
      throw new RangeError("Unknown ColorInputGroup variant");
    return [
      group.root,
      data["lensoFullWidth"] === "true" && group.fullWidth,
      data["lensoVariant"] === "secondary" && group.secondary,
      data["lensoDisabled"] === "true" && group.disabled,
      data["lensoInvalid"] === "true" && group.invalid,
    ];
  }
  if (kind === "color-field-input")
    return [inputGroupMaterialStyles.input, group.input, native.input];
  if (kind === "color-field-description") return [field.description];
  if (kind === "color-field-error") return [field.error];
  if (kind === "color-request") return [];
  if (kind === "color-input-prefix") return [group.prefix];
  if (kind === "color-input-suffix") return [group.suffix];
  return undefined;
}
