import { Label as FieldLabel } from "./label.js";
import { Description as FieldDescription } from "./description.js";
import { textFieldStyles } from "@lenso/tokens/textfield";
import { inputStyles } from "@lenso/tokens/input";
import { groupStyles } from "@lenso/tokens/surface";
import { Input as SdkInput } from "@ui-sdk/solid/input";
import { Field as SdkRoot } from "@ui-sdk/solid/field";
import { type ComponentProps } from "solid-js";
import { htmlPart, sdkPart, type StyledPart } from "./parts.js";

export const TextFieldRoot: StyledPart<typeof SdkRoot, { layout?: "row" | "stacked" }> = sdkPart<
  ComponentProps<typeof SdkRoot>,
  { layout?: "row" | "stacked" }
>(
  SdkRoot,
  "textfield",
  (props) => [textFieldStyles.root, props.layout === "row" && textFieldStyles.row],
  "layout",
);
export const TextFieldGroup = htmlPart("fieldset", "textfield-group", () => [
  groupStyles.surface,
  groupStyles.group,
  textFieldStyles.group,
]);
export const TextFieldInput: StyledPart<
  typeof SdkInput,
  { variant?: "primary" | "secondary"; fullWidth?: boolean }
> = sdkPart<
  ComponentProps<typeof SdkInput>,
  { variant?: "primary" | "secondary"; fullWidth?: boolean }
>(
  SdkInput,
  "textfield-input",
  (props) => [
    inputStyles.input,
    textFieldStyles.control,
    props.variant === "secondary" && inputStyles.secondary,
    props.fullWidth && inputStyles.fullWidth,
  ],
  "variant",
  "fullWidth",
);

export const TextField: typeof TextFieldRoot & {
  Label: typeof FieldLabel;
  Description: typeof FieldDescription;
  Root: typeof TextFieldRoot;
  Group: typeof TextFieldGroup;
  Input: typeof TextFieldInput;
} = Object.assign(TextFieldRoot, {
  Label: FieldLabel,
  Description: FieldDescription,
  Root: TextFieldRoot,
  Group: TextFieldGroup,
  Input: TextFieldInput,
});
