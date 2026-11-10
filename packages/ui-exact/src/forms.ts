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
});

const presentations = new Map([
  ["text-field", stylex.props(textFieldStyles.root)],
  ["input-adornment", stylex.props(inputGroupMaterialStyles.adornment)],
  ["description", stylex.props(descriptionStyles.description)],
  ["field-error", stylex.props(fieldErrorStyles.error)],
  ["fieldset", stylex.props(fieldsetStyles.root)],
  ["legend", stylex.props(fieldsetStyles.legend)],
  ["checkbox", stylex.props(checkboxStyles.root)],
  ["checkbox-content", stylex.props(checkboxStyles.content)],
  ["checkbox-control", stylex.props(checkboxStyles.control, nativeStyles.choiceFocus)],
  ["checkbox-indicator", stylex.props(checkboxStyles.indicator)],
  ["checkbox-checkmark", stylex.props(checkboxStyles.checkmark)],
  ["checkbox-mixed", stylex.props(checkboxStyles.indeterminate)],
  ["checkbox-group", stylex.props(checkboxGroupStyles.root)],
  ["choice-input", stylex.props(nativeStyles.choiceInput)],
  ["radio", stylex.props(radioStyles.root)],
  ["radio-content", stylex.props(radioStyles.content)],
  ["radio-control", stylex.props(radioStyles.control, nativeStyles.choiceFocus)],
  ["radio-indicator", stylex.props(radioStyles.indicator)],
  ["radio-group", stylex.props(radioGroupStyles.root)],
]);

export function formPresentation(kind: string, data: DOMStringMap, inputGroup: boolean) {
  if (kind === "input" || kind === "textarea" || kind === "input-group") {
    const variant = data["lensoVariant"];
    if (variant !== "primary" && variant !== "secondary")
      throw new RangeError(`Unknown Lenso field variant: ${variant}`);
    return stylex.props(
      inputStyles.input,
      kind === "input-group" && inputStyles.group,
      variant === "secondary" && inputStyles.secondary,
      kind === "textarea" && textAreaStyles.textarea,
      kind !== "input-group" && inputGroup && inputStyles.groupedControl,
      kind === "textarea" && inputGroup && inputStyles.groupedTextArea,
      kind === "textarea" && data["lensoRows"] === "1" && textAreaStyles.singleLine,
    );
  }
  if (kind === "label")
    return stylex.props(
      labelStyles.label,
      nativeStyles.label,
      data["lensoRequired"] === "true" && labelStyles.required,
    );
  return presentations.get(kind);
}

export const formKinds = [...presentations.keys()];
