import { numberFieldStyles, numberFieldGroupStyles } from "@lenso/tokens/number-field";
import { inputGroupMaterialStyles } from "@lenso/tokens/input-group";
import {
  NumberInput as SdkRoot,
  NumberInputGroup as SdkGroup,
  NumberInputControl as SdkInput,
  NumberInputIncrement as SdkIncrementButton,
  NumberInputDecrement as SdkDecrementButton,
  NumberInputScrubArea as SdkScrubArea,
  NumberInputScrubAreaCursor as SdkScrubAreaCursor,
} from "@ui-sdk/solid/number-input";
import { createComponent, type ComponentProps } from "solid-js";
import { sdkPart, type StyledPart } from "./parts.js";

export const NumberFieldRoot: StyledPart<typeof SdkRoot, { fullWidth?: boolean }> = sdkPart<
  ComponentProps<typeof SdkRoot>,
  { fullWidth?: boolean }
>(
  SdkRoot,
  "number-field",
  (props) => [numberFieldStyles.root, props.fullWidth && numberFieldGroupStyles.fullWidth],
  "fullWidth",
);
export const NumberFieldGroup: StyledPart<
  typeof SdkGroup,
  { variant?: "primary" | "secondary"; fullWidth?: boolean }
> = sdkPart<
  ComponentProps<typeof SdkGroup>,
  { variant?: "primary" | "secondary"; fullWidth?: boolean }
>(
  SdkGroup,
  "number-field-group",
  (props) => [
    numberFieldGroupStyles.root,
    inputGroupMaterialStyles.root,
    props.variant === "secondary" && inputGroupMaterialStyles.secondary,
    props.fullWidth && inputGroupMaterialStyles.fullWidth,
  ],
  "variant",
  "fullWidth",
);
export const NumberFieldInput: StyledPart<typeof SdkInput> = sdkPart(
  SdkInput,
  "number-field-input",
  () => [numberFieldStyles.input, inputGroupMaterialStyles.input],
);
export const NumberFieldIncrementButton: StyledPart<typeof SdkIncrementButton> = sdkPart(
  SdkIncrementButton,
  "number-field-increment-button",
  () => [numberFieldStyles.button, numberFieldStyles.increment],
);
export const NumberFieldDecrementButton: StyledPart<typeof SdkDecrementButton> = sdkPart(
  SdkDecrementButton,
  "number-field-decrement-button",
  () => [numberFieldStyles.button, numberFieldStyles.decrement],
);
export const NumberFieldScrubArea = (props: ComponentProps<typeof SdkScrubArea>) =>
  createComponent(SdkScrubArea, props);
export const NumberFieldScrubAreaCursor = (props: ComponentProps<typeof SdkScrubAreaCursor>) =>
  createComponent(SdkScrubAreaCursor, props);

export const NumberField: typeof NumberFieldRoot & {
  Root: typeof NumberFieldRoot;
  Group: typeof NumberFieldGroup;
  Input: typeof NumberFieldInput;
  IncrementButton: typeof NumberFieldIncrementButton;
  DecrementButton: typeof NumberFieldDecrementButton;
  ScrubArea: typeof NumberFieldScrubArea;
  ScrubAreaCursor: typeof NumberFieldScrubAreaCursor;
} = Object.assign(NumberFieldRoot, {
  Root: NumberFieldRoot,
  Group: NumberFieldGroup,
  Input: NumberFieldInput,
  IncrementButton: NumberFieldIncrementButton,
  DecrementButton: NumberFieldDecrementButton,
  ScrubArea: NumberFieldScrubArea,
  ScrubAreaCursor: NumberFieldScrubAreaCursor,
});
