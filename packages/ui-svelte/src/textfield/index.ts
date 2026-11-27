import { Label as FieldLabel } from "../label/index.js";
import { Description as FieldDescription } from "../description/index.js";
import TextFieldRoot from "./text-field-root.svelte";
import TextFieldGroup from "./text-field-group.svelte";
import TextFieldInput from "./text-field-input.svelte";

export { TextFieldRoot, TextFieldGroup, TextFieldInput };
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
