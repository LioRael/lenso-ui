import TimeFieldInput from "./time-field-input.svelte";
export { TimeFieldInput };
import { DateInputGroup } from "../date-input-group/index.js";
import TimeFieldRoot from "./time-field-root.svelte";
import TimeFieldSegment from "./time-field-segment.svelte";
import TimeFieldLabel from "./time-field-label.svelte";
import TimeFieldDescription from "./time-field-description.svelte";
import TimeFieldError from "./time-field-error.svelte";

export { TimeFieldRoot, TimeFieldSegment, TimeFieldLabel, TimeFieldDescription, TimeFieldError };
export const TimeField: typeof TimeFieldRoot & {
  Group: typeof DateInputGroup.Root;
  InputContainer: typeof DateInputGroup.InputContainer;
  Prefix: typeof DateInputGroup.Prefix;
  Suffix: typeof DateInputGroup.Suffix;
  Input: typeof TimeFieldInput;
  Root: typeof TimeFieldRoot;
  Segment: typeof TimeFieldSegment;
  Label: typeof TimeFieldLabel;
  Description: typeof TimeFieldDescription;
  Error: typeof TimeFieldError;
} = Object.assign(TimeFieldRoot, {
  Group: DateInputGroup.Root,
  InputContainer: DateInputGroup.InputContainer,
  Prefix: DateInputGroup.Prefix,
  Suffix: DateInputGroup.Suffix,
  Input: TimeFieldInput,
  Root: TimeFieldRoot,
  Segment: TimeFieldSegment,
  Label: TimeFieldLabel,
  Description: TimeFieldDescription,
  Error: TimeFieldError,
});

export {
  createTimeInputController as createTimeFieldController,
  type TimeInputController as TimeFieldController,
} from "@ui-sdk/core/time-input";
