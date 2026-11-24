import { descriptionStyles } from "@lenso/tokens/description";
import { textFieldStyles } from "@lenso/tokens/textfield";
import { checkboxSupportingStyles } from "@lenso/tokens/checkbox";
import { FieldDescription as SdkRoot } from "@ui-sdk/solid/field";
import { sdkPart, type StyledPart } from "./parts.js";

export const DescriptionRoot: StyledPart<typeof SdkRoot> = sdkPart(SdkRoot, "description", () => [
  descriptionStyles.description,
  textFieldStyles.supporting,
  checkboxSupportingStyles.direct,
]);

export const Description: typeof DescriptionRoot & {
  Root: typeof DescriptionRoot;
} = Object.assign(DescriptionRoot, {
  Root: DescriptionRoot,
});
