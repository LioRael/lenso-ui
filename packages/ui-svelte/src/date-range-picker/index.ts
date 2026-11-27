import { DatePicker } from "../date-picker/index.js";
import DateRangePickerRoot from "./date-range-picker.svelte";
import DateRangePickerSeparator from "./date-range-picker-separator.svelte";

export { DateRangePickerRoot, DateRangePickerSeparator };
export type { DateRangePickerProps } from "./date-range-picker.svelte";
export const DateRangePicker: typeof DateRangePickerRoot &
  Omit<typeof DatePicker, "Root"> & { Root: typeof DateRangePickerRoot } & {
    RangeSeparator: typeof DateRangePickerSeparator;
    Separator: typeof DateRangePickerSeparator;
  } = Object.assign(DateRangePickerRoot, DatePicker, {
  Root: DateRangePickerRoot,
  RangeSeparator: DateRangePickerSeparator,
  Separator: DateRangePickerSeparator,
});

export {
  createDatePickerController as createDateRangePickerController,
  type DatePickerController as DateRangePickerController,
} from "@ui-sdk/core/date-picker";

export const DateRangePickerClose: typeof DateRangePicker.Close = DateRangePicker.Close;

export const DateRangePickerDescription: typeof DateRangePicker.Description =
  DateRangePicker.Description;

export const DateRangePickerError: typeof DateRangePicker.Error = DateRangePicker.Error;

export const DateRangePickerLabel: typeof DateRangePicker.Label = DateRangePicker.Label;

export const DateRangePickerPopover: typeof DateRangePicker.Popover = DateRangePicker.Popover;

export const DateRangePickerPopoverDescription: typeof DateRangePicker.PopoverDescription =
  DateRangePicker.PopoverDescription;

export const DateRangePickerRangeSeparator: typeof DateRangePicker.RangeSeparator =
  DateRangePicker.RangeSeparator;

export const DateRangePickerTitle: typeof DateRangePicker.Title = DateRangePicker.Title;

export const DateRangePickerTrigger: typeof DateRangePicker.Trigger = DateRangePicker.Trigger;

export const DateRangePickerTriggerIndicator: typeof DateRangePicker.TriggerIndicator =
  DateRangePicker.TriggerIndicator;
