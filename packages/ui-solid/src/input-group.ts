import { inputStyles } from "@lenso/tokens/input";
import { inputGroupMaterialStyles } from "@lenso/tokens/input-group";
import { textAreaInputStyles } from "@lenso/tokens/textarea";
import { Textarea as SdkTextarea } from "@ui-sdk/solid/textarea";
import { InputGroup as SdkRoot, Input as SdkInput } from "@ui-sdk/solid/input";
import { type ComponentProps } from "solid-js";
import { htmlPart, sdkPart, type StyledPart } from "./parts.js";

export const InputGroupRoot: StyledPart<
  typeof SdkRoot,
  { variant?: "primary" | "secondary"; fullWidth?: boolean }
> = sdkPart<
  ComponentProps<typeof SdkRoot>,
  { variant?: "primary" | "secondary"; fullWidth?: boolean }
>(
  SdkRoot,
  "input-group",
  (props) => [
    inputStyles.input,
    inputStyles.group,
    props.variant === "secondary" && inputStyles.secondary,
    props.fullWidth && inputStyles.fullWidth,
  ],
  "variant",
  "fullWidth",
);
export const InputGroupInput: StyledPart<typeof SdkInput> = sdkPart(
  SdkInput,
  "input-group-input",
  () => [inputStyles.input, inputStyles.groupedControl],
);
export const InputGroupPrefix = htmlPart(
  "div",
  "input-group-prefix",
  () => inputGroupMaterialStyles.adornment,
);
export const InputGroupSuffix = htmlPart(
  "div",
  "input-group-suffix",
  () => inputGroupMaterialStyles.adornment,
);

export const InputGroupTextArea: StyledPart<typeof SdkTextarea> = sdkPart(
  SdkTextarea,
  "input-group-textarea",
  () => [textAreaInputStyles.input, inputStyles.groupedControl, inputStyles.groupedTextArea],
);

export const InputGroup: typeof InputGroupRoot & {
  Root: typeof InputGroupRoot;
  Input: typeof InputGroupInput;
  Prefix: typeof InputGroupPrefix;
  Suffix: typeof InputGroupSuffix;
} = Object.assign(InputGroupRoot, {
  Root: InputGroupRoot,
  Input: InputGroupInput,
  Prefix: InputGroupPrefix,
  Suffix: InputGroupSuffix,
});
