import { NumberInputScrubArea as NumberFieldScrubArea } from "@ui-sdk/svelte/number-input";
import { NumberInputScrubAreaCursor as NumberFieldScrubAreaCursor } from "@ui-sdk/svelte/number-input";
import NumberFieldRoot from "./number-field-root.svelte";
import NumberFieldGroup from "./number-field-group.svelte";
import NumberFieldInput from "./number-field-input.svelte";
import NumberFieldIncrementButton from "./number-field-increment-button.svelte";
import NumberFieldDecrementButton from "./number-field-decrement-button.svelte";

export {
  NumberFieldRoot,
  NumberFieldGroup,
  NumberFieldInput,
  NumberFieldIncrementButton,
  NumberFieldDecrementButton,
  NumberFieldScrubArea,
  NumberFieldScrubAreaCursor,
};
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
