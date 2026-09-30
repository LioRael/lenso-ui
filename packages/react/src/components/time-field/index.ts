/** HeroUI v3.2.6 derived work. Copyright NextUI Inc. Apache-2.0. Modified for Lenso StyleX. */
export {
  TimeFieldRoot,
  TimeFieldLabel,
  TimeFieldDescription,
  TimeFieldError,
} from "./time-field.js";
export type { TimeFieldRootProps, TimeFieldRootProps as TimeFieldProps } from "./time-field.js";
import {
  TimeFieldRoot,
  TimeFieldLabel,
  TimeFieldDescription,
  TimeFieldError,
} from "./time-field.js";
import { DateInputGroup } from "../date-input-group/index.js";
export const TimeField = Object.assign(TimeFieldRoot, {
  Root: TimeFieldRoot,
  Label: TimeFieldLabel,
  Description: TimeFieldDescription,
  Error: TimeFieldError,
  Group: DateInputGroup.Root,
  Input: DateInputGroup.Input,
  Segment: DateInputGroup.Segment,
  InputContainer: DateInputGroup.InputContainer,
  Prefix: DateInputGroup.Prefix,
  Suffix: DateInputGroup.Suffix,
});
