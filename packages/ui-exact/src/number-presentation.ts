import * as stylex from "@stylexjs/stylex";
import {
  numberFieldStyles as n,
  numberFieldGroupStyles as group,
} from "@lenso/tokens/number-field";
import { stepperStyles as s } from "@lenso/tokens/stepper";
import { inputGroupMaterialStyles as material } from "@lenso/tokens/input-group";
import { glassStyles } from "@lenso/tokens/glass";
import { liquidMaterialStyles } from "@lenso/tokens/materials";
import type { StyleInput } from "./style-types.js";
const native = stylex.create({
  scrubArea: { touchAction: "none", WebkitUserSelect: "none", userSelect: "none" },
  scrubCursor: {
    position: "fixed",
    inset: "auto",
    top: 0,
    left: 0,
    margin: 0,
    padding: 0,
    border: 0,
    backgroundColor: "transparent",
    outline: "none",
    pointerEvents: "none",
    maxWidth: "none",
    maxHeight: "none",
    width: "max-content",
    height: "max-content",
    overflow: "visible",
    display: { default: "none", ":popover-open": "block" },
    "::backdrop": { display: "none" },
  },
  input: {
    appearance: { default: "none", ":is(#exact-root input[data-native])": "none" },
    borderWidth: { default: 0, ":is(#exact-root input[data-native])": 0 },
    borderRadius: { default: 0, ":is(#exact-root input[data-native])": 0 },
    padding: { default: "8px 12px", ":is(#exact-root input[data-native])": "8px 12px" },
    lineHeight: { default: "20px", ":is(#exact-root input[data-native])": "20px" },
    "::-webkit-inner-spin-button": { appearance: "none", margin: 0 },
    "::-webkit-outer-spin-button": { appearance: "none", margin: 0 },
  },
  stepperRoot: { width: "max-content" },
  button: { userSelect: "none", WebkitUserSelect: "none", touchAction: "manipulation" },
  hidden: { display: "none" },
  unavailable: { ':is([aria-disabled="true"])': { opacity: 0.5, cursor: "default" } },
  stepperUnavailable: {
    ':is([aria-disabled="true"])': { color: "var(--lenso-label-tertiary)", cursor: "default" },
  },
  stepperInput: {
    width: { default: 1, ":is(#exact-root input[data-native])": 1 },
    height: { default: 1, ":is(#exact-root input[data-native])": 1 },
    padding: { default: 0, ":is(#exact-root input[data-native])": 0 },
    borderRadius: { default: 0, ":is(#exact-root input[data-native])": 0 },
    borderWidth: { default: 0, ":is(#exact-root input[data-native])": 0 },
  },
});
const parts = new Map<string, StyleInput>([
  ["number-scrub-area", [native.scrubArea]],
  ["number-scrub-cursor", [native.scrubCursor]],
  ["number-field-input", [n.input, material.input, native.input]],
  ["number-field-increment", [n.button, n.increment, native.button, native.unavailable]],
  ["number-field-decrement", [n.button, n.decrement, native.button, native.unavailable]],
  ["number-request", [native.hidden]],
  ["number-form", [native.hidden]],
  ["stepper", [s.root, native.stepperRoot]],
  ["stepper-group", [s.group]],
  ["stepper-input", [s.input, native.stepperInput]],
  ["stepper-increment", [s.button, s.increment, native.button, native.stepperUnavailable]],
  ["stepper-decrement", [s.button, s.decrement, native.button, native.stepperUnavailable]],
  ["stepper-separator", [s.separator]],
]);
export const numberKinds = [...parts.keys()];
export function numberPresentation(kind: string, data: DOMStringMap): StyleInput | undefined {
  if (kind === "number-field")
    return [n.root, data["lensoFullWidth"] === "true" && group.fullWidth];
  if (kind === "number-field-group") {
    if (!["primary", "secondary"].includes(data["lensoVariant"] ?? ""))
      throw new RangeError("NumberField variant must be primary or secondary");
    return [
      liquidMaterialStyles.small,
      group.root,
      glassStyles.optics,
      material.root,
      data["lensoVariant"] === "secondary" && material.secondary,
      data["lensoFullWidth"] === "true" && material.fullWidth,
    ];
  }
  return parts.get(kind);
}
