/** HeroUI v3.2.6 derived work. Copyright NextUI Inc. Apache-2.0. Modified for Lenso StyleX. */
import type { ComponentProps } from "react";
import {
  DateRangePickerRoot,
  DateRangePickerTrigger,
  DateRangePickerTriggerIndicator,
  DateRangePickerPopover,
  DateRangePickerDialog,
  DateRangePickerLabel,
  DateRangePickerDescription,
  DateRangePickerError,
  DateRangePickerRangeSeparator,
} from "./date-range-picker.js";
import { DateInputGroup } from "../date-input-group/index.js";
import { DatePickerPrefix, DatePickerSuffix } from "../date-picker/date-picker.js";
export {
  DateRangePickerRoot,
  DateRangePickerTrigger,
  DateRangePickerTriggerIndicator,
  DateRangePickerPopover,
  DateRangePickerDialog,
  DateRangePickerLabel,
  DateRangePickerDescription,
  DateRangePickerError,
  DateRangePickerRangeSeparator,
};
export type {
  DateRangePickerRootProps,
  DateRangePickerRootProps as DateRangePickerProps,
} from "./date-range-picker.js";
export type DateRangePickerTriggerProps = ComponentProps<typeof DateRangePickerTrigger>;
export type DateRangePickerTriggerIndicatorProps = ComponentProps<
  typeof DateRangePickerTriggerIndicator
>;
export type DateRangePickerRangeSeparatorProps = ComponentProps<
  typeof DateRangePickerRangeSeparator
>;
export type DateRangePickerPopoverProps = ComponentProps<typeof DateRangePickerPopover>;
export const DateRangePicker = Object.assign(DateRangePickerRoot, {
  Root: DateRangePickerRoot,
  Trigger: DateRangePickerTrigger,
  TriggerIndicator: DateRangePickerTriggerIndicator,
  Popover: DateRangePickerPopover,
  Dialog: DateRangePickerDialog,
  Label: DateRangePickerLabel,
  Description: DateRangePickerDescription,
  Error: DateRangePickerError,
  RangeSeparator: DateRangePickerRangeSeparator,
  Group: DateInputGroup.Root,
  Input: DateInputGroup.Input,
  Segment: DateInputGroup.Segment,
  InputContainer: DateInputGroup.InputContainer,
  Prefix: DatePickerPrefix,
  Suffix: DatePickerSuffix,
});
