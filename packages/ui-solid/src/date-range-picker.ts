import { createComponent, merge, type ComponentProps } from "solid-js";
import { DatePicker } from "./date-picker.jsx";
import { dateRangePickerStyles } from "@lenso/tokens/date-range-picker";
import { htmlPart } from "./parts.js";

export type DateRangePickerProps = Omit<ComponentProps<typeof DatePicker.Root>, "mode">;

export function DateRangePickerRoot(props: DateRangePickerProps) {
  return createComponent(
    DatePicker.Root,
    merge(props, {
      mode: "range" as const,
      get xstyle() {
        return [dateRangePickerStyles.root, props.xstyle];
      },
    }),
  );
}

export const DateRangePickerSeparator = htmlPart(
  "span",
  "date-range-picker-separator",
  () => dateRangePickerStyles.separator,
);
export const DateRangePicker: typeof DateRangePickerRoot &
  Omit<typeof DatePicker, "Root"> & {
    Root: typeof DateRangePickerRoot;
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
