import StepperRoot from "./stepper-root.svelte";
import StepperGroup from "./stepper-group.svelte";
import StepperInput from "./stepper-input.svelte";
import StepperIncrement from "./stepper-increment.svelte";
import StepperDecrement from "./stepper-decrement.svelte";
import StepperSeparator from "./stepper-separator.svelte";

export {
  StepperRoot,
  StepperGroup,
  StepperInput,
  StepperIncrement,
  StepperDecrement,
  StepperSeparator,
};
export const Stepper: typeof StepperRoot & {
  DecrementButton: typeof StepperDecrement;
  IncrementButton: typeof StepperIncrement;
  Root: typeof StepperRoot;
  Group: typeof StepperGroup;
  Input: typeof StepperInput;
  Increment: typeof StepperIncrement;
  Decrement: typeof StepperDecrement;
  Separator: typeof StepperSeparator;
} = Object.assign(StepperRoot, {
  DecrementButton: StepperDecrement,
  IncrementButton: StepperIncrement,
  Root: StepperRoot,
  Group: StepperGroup,
  Input: StepperInput,
  Increment: StepperIncrement,
  Decrement: StepperDecrement,
  Separator: StepperSeparator,
});

export const StepperDecrementButton: typeof Stepper.DecrementButton = Stepper.DecrementButton;

export const StepperIncrementButton: typeof Stepper.IncrementButton = Stepper.IncrementButton;
