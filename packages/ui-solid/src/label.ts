import { labelStyles } from "@lenso/tokens/label";
import { textFieldStyles } from "@lenso/tokens/textfield";
import { FieldLabel as SdkRoot } from "@ui-sdk/solid/field";
import { sdkPart, type StyledPart } from "./parts.js";

export const LabelRoot: StyledPart<typeof SdkRoot> = sdkPart(SdkRoot, "label", () => [
  labelStyles.label,
  textFieldStyles.rowLabel,
]);

export const Label: typeof LabelRoot & {
  Root: typeof LabelRoot;
} = Object.assign(LabelRoot, {
  Root: LabelRoot,
});
