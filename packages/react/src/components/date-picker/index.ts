/** HeroUI v3.2.6 derived work. Copyright NextUI Inc. Apache-2.0. Modified for Lenso StyleX. */
import type { ComponentProps } from "react";
import {
  DatePickerRoot,
  DatePickerTrigger,
  DatePickerTriggerIndicator,
  DatePickerPopover,
  DatePickerDialog,
  DatePickerLabel,
  DatePickerDescription,
  DatePickerError,
  DatePickerPrefix,
  DatePickerSuffix,
} from "./date-picker.js";
import { DateInputGroup } from "../date-input-group/index.js";
export {
  DatePickerRoot,
  DatePickerTrigger,
  DatePickerTriggerIndicator,
  DatePickerPopover,
  DatePickerDialog,
  DatePickerLabel,
  DatePickerDescription,
  DatePickerError,
};
export type { DatePickerRootProps, DatePickerRootProps as DatePickerProps } from "./date-picker.js";
export type DatePickerTriggerProps = ComponentProps<typeof DatePickerTrigger>;
export type DatePickerTriggerIndicatorProps = ComponentProps<typeof DatePickerTriggerIndicator>;
export type DatePickerPopoverProps = ComponentProps<typeof DatePickerPopover>;
export const DatePicker = Object.assign(DatePickerRoot, {
  Root: DatePickerRoot,
  Trigger: DatePickerTrigger,
  TriggerIndicator: DatePickerTriggerIndicator,
  Popover: DatePickerPopover,
  Dialog: DatePickerDialog,
  Label: DatePickerLabel,
  Description: DatePickerDescription,
  Error: DatePickerError,
  Group: DateInputGroup.Root,
  Input: DateInputGroup.Input,
  Segment: DateInputGroup.Segment,
  InputContainer: DateInputGroup.InputContainer,
  Prefix: DatePickerPrefix,
  Suffix: DatePickerSuffix,
});
