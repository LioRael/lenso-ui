import { stepperStyles } from "@lenso/tokens/stepper";
import {
  NumberInput as SdkRoot,
  NumberInputGroup as SdkGroup,
  NumberInputControl as SdkInput,
  NumberInputIncrement as SdkIncrement,
  NumberInputDecrement as SdkDecrement,
} from "@ui-sdk/solid/number-input";
import { htmlPart, sdkPart, type StyledPart } from "./parts.js";

export const StepperRoot: StyledPart<typeof SdkRoot> = sdkPart(
  SdkRoot,
  "stepper",
  () => stepperStyles.root,
);
export const StepperGroup: StyledPart<typeof SdkGroup> = sdkPart(
  SdkGroup,
  "stepper-group",
  () => stepperStyles.group,
);
export const StepperInput: StyledPart<typeof SdkInput> = sdkPart(
  SdkInput,
  "stepper-input",
  () => stepperStyles.input,
);
export const StepperIncrement: StyledPart<typeof SdkIncrement> = sdkPart(
  SdkIncrement,
  "stepper-increment",
  () => [stepperStyles.button, stepperStyles.increment],
);
export const StepperDecrement: StyledPart<typeof SdkDecrement> = sdkPart(
  SdkDecrement,
  "stepper-decrement",
  () => [stepperStyles.button, stepperStyles.decrement],
);
export const StepperSeparator = htmlPart(
  "span",
  "stepper-separator",
  () => stepperStyles.separator,
);

export const Stepper: typeof StepperRoot & {
  Root: typeof StepperRoot;
  Group: typeof StepperGroup;
  Input: typeof StepperInput;
  Increment: typeof StepperIncrement;
  Decrement: typeof StepperDecrement;
  Separator: typeof StepperSeparator;
} = Object.assign(StepperRoot, {
  Root: StepperRoot,
  Group: StepperGroup,
  Input: StepperInput,
  Increment: StepperIncrement,
  Decrement: StepperDecrement,
  Separator: StepperSeparator,
});
