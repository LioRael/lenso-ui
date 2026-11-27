import DateFieldInput from "./date-field-input.svelte";
export { DateFieldInput };
import { DateInputGroup } from "../date-input-group/index.js";
import DateFieldRoot from "./date-field-root.svelte";
import DateFieldSegment from "./date-field-segment.svelte";
import DateFieldLabel from "./date-field-label.svelte";
import DateFieldDescription from "./date-field-description.svelte";
import DateFieldError from "./date-field-error.svelte";

export { DateFieldRoot, DateFieldSegment, DateFieldLabel, DateFieldDescription, DateFieldError };
export const DateField: typeof DateFieldRoot & {
  Group: typeof DateInputGroup.Root;
  InputContainer: typeof DateInputGroup.InputContainer;
  Prefix: typeof DateInputGroup.Prefix;
  Suffix: typeof DateInputGroup.Suffix;
  Input: typeof DateFieldInput;
  Root: typeof DateFieldRoot;
  Segment: typeof DateFieldSegment;
  Label: typeof DateFieldLabel;
  Description: typeof DateFieldDescription;
  Error: typeof DateFieldError;
} = Object.assign(DateFieldRoot, {
  Group: DateInputGroup.Root,
  InputContainer: DateInputGroup.InputContainer,
  Prefix: DateInputGroup.Prefix,
  Suffix: DateInputGroup.Suffix,
  Input: DateFieldInput,
  Root: DateFieldRoot,
  Segment: DateFieldSegment,
  Label: DateFieldLabel,
  Description: DateFieldDescription,
  Error: DateFieldError,
});

export {
  createDateInputController as createDateFieldController,
  type DateInputController as DateFieldController,
} from "@ui-sdk/core/date-input";
