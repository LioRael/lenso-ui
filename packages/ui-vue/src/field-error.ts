import { fieldErrorStyles } from "@lenso/tokens/field-error";
import { textFieldStyles } from "@lenso/tokens/textfield";
import { checkboxSupportingStyles } from "@lenso/tokens/checkbox";
import { FieldError as SdkRoot } from "@ui-sdk/vue/field";
import { sdkPart, type StyledPart } from "./parts.js";

export const FieldErrorRoot: StyledPart<typeof SdkRoot> = sdkPart(SdkRoot, "field-error", () => [
  fieldErrorStyles.error,
  textFieldStyles.supporting,
  checkboxSupportingStyles.error,
]);

export const FieldError: typeof FieldErrorRoot & {
  Root: typeof FieldErrorRoot;
} = Object.assign(FieldErrorRoot, {
  Root: FieldErrorRoot,
});
