import { defineComponent, h } from "vue";
import type { ComponentProps, StyleXArgument } from "./parts.js";
import { DatePicker, datePickerParts } from "./date-picker.js";
import { dateRangePickerStyles } from "@lenso/tokens/date-range-picker";
import { htmlPart } from "./parts.js";

export type DateRangePickerProps = Omit<ComponentProps<typeof DatePicker.Root>, "mode">;

export const DateRangePickerRoot = defineComponent({
  name: "LensoDateRangePicker",
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () =>
      h(
        DatePicker.Root,
        {
          ...attrs,
          mode: "range",
          xstyle: [dateRangePickerStyles.root, attrs["xstyle"] as StyleXArgument],
        },
        slots,
      );
  },
}) as unknown as new () => Omit<InstanceType<typeof DatePicker.Root>, "$props"> & {
  $props: DateRangePickerProps;
};

export const DateRangePickerSeparator = htmlPart(
  "span",
  "date-range-picker-separator",
  () => dateRangePickerStyles.separator,
);
export const DateRangePicker: typeof DateRangePickerRoot &
  Omit<typeof datePickerParts, "Root"> & {
    Root: typeof DateRangePickerRoot;
    RangeSeparator: typeof DateRangePickerSeparator;
    Separator: typeof DateRangePickerSeparator;
  } = Object.assign(DateRangePickerRoot, datePickerParts, {
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
