/** HeroUI v3.2.6 derived work. Copyright NextUI Inc. Apache-2.0. Modified for Lenso StyleX. */
export {
  DateFieldRoot,
  DateFieldLabel,
  DateFieldDescription,
  DateFieldError,
} from "./date-field.js";
export type { DateFieldRootProps, DateFieldRootProps as DateFieldProps } from "./date-field.js";
import {
  DateFieldRoot,
  DateFieldLabel,
  DateFieldDescription,
  DateFieldError,
} from "./date-field.js";
import { DateInputGroup } from "../date-input-group/index.js";
export const DateField = Object.assign(DateFieldRoot, {
  Root: DateFieldRoot,
  Label: DateFieldLabel,
  Description: DateFieldDescription,
  Error: DateFieldError,
  Group: DateInputGroup.Root,
  Input: DateInputGroup.Input,
  Segment: DateInputGroup.Segment,
  InputContainer: DateInputGroup.InputContainer,
  Prefix: DateInputGroup.Prefix,
  Suffix: DateInputGroup.Suffix,
});
