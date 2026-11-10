import type { StyleInput } from "./style-types.js";
import * as stylex from "@stylexjs/stylex";
import { inputStyles } from "@lenso/tokens/input";
import { textAreaStyles } from "@lenso/tokens/textarea";
import { textFieldStyles } from "@lenso/tokens/textfield";
import { inputGroupMaterialStyles } from "@lenso/tokens/input-group";
import { labelStyles } from "@lenso/tokens/label";
import { descriptionStyles } from "@lenso/tokens/description";
import { fieldErrorStyles } from "@lenso/tokens/field-error";
import { fieldsetStyles } from "@lenso/tokens/fieldset";
import { checkboxStyles } from "@lenso/tokens/checkbox";
import { checkboxGroupStyles } from "@lenso/tokens/checkbox-group";
import { radioStyles } from "@lenso/tokens/radio";
import { radioGroupStyles } from "@lenso/tokens/radio-group";

const nativeStyles = stylex.create({
  choiceInput: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    margin: 0,
    opacity: 0,
    zIndex: 20,
    cursor: { default: "pointer", ":disabled": "default" },
  },
  choiceFocus: {
    outline: {
      default: "none",
      ":is([data-slot='checkbox']:has(input:focus-visible) *, [data-slot='radio']:has(input:focus-visible) *)":
        "1.5px solid var(--lenso-focus-ring)",
    },
    outlineOffset: 3,
  },
  label: { cursor: "text" },
  nativeAlertInput: {
    // Exact's stock alert layout gives every input a 100% flex basis.
    flexBasis: {
      default: null,
      ":is(#exact-root dialog[data-lenso-kind='alert-dialog'] input)": "auto",
    },
  },
});

const presentations = new Map<string, StyleInput>([
  ["text-field", [textFieldStyles.root]],
  ["input-adornment", [inputGroupMaterialStyles.adornment]],
  ["description", [descriptionStyles.description]],
  ["field-error", [fieldErrorStyles.error]],
  ["fieldset", [fieldsetStyles.root]],
  ["legend", [fieldsetStyles.legend]],
  ["checkbox", [checkboxStyles.root]],
  ["checkbox-content", [checkboxStyles.content]],
  ["checkbox-control", [checkboxStyles.control, nativeStyles.choiceFocus]],
  ["checkbox-indicator", [checkboxStyles.indicator]],
  ["checkbox-checkmark", [checkboxStyles.checkmark]],
  ["checkbox-mixed", [checkboxStyles.indeterminate]],
  ["checkbox-group", [checkboxGroupStyles.root]],
  ["choice-input", [nativeStyles.choiceInput]],
  ["radio", [radioStyles.root]],
  ["radio-content", [radioStyles.content]],
  ["radio-control", [radioStyles.control, nativeStyles.choiceFocus]],
  ["radio-indicator", [radioStyles.indicator]],
  ["radio-group", [radioGroupStyles.root]],
]);

export function formPresentation(kind: string, data: DOMStringMap, inputGroup: boolean) {
  if (kind === "input" || kind === "textarea" || kind === "input-group") {
    const variant = data["lensoVariant"];
    if (variant !== "primary" && variant !== "secondary")
      throw new RangeError(`Unknown Lenso field variant: ${variant}`);
    return [
      inputStyles.input,
      kind === "input" && nativeStyles.nativeAlertInput,
      kind === "input-group" && inputStyles.group,
      variant === "secondary" && inputStyles.secondary,
      kind === "textarea" && textAreaStyles.textarea,
      kind !== "input-group" && inputGroup && inputStyles.groupedControl,
      kind === "textarea" && inputGroup && inputStyles.groupedTextArea,
      kind === "textarea" && data["lensoRows"] === "1" && textAreaStyles.singleLine,
    ];
  }
  if (kind === "label")
    return [
      labelStyles.label,
      nativeStyles.label,
      data["lensoRequired"] === "true" && labelStyles.required,
    ];
  return presentations.get(kind);
}

export const formKinds = [...presentations.keys()];
