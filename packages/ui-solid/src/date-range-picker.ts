import { createComponent, merge, type ComponentProps } from "solid-js";
import { DatePicker } from "./date-picker.js";
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
    Separator: typeof DateRangePickerSeparator;
  } = Object.assign(DateRangePickerRoot, DatePicker, {
  Root: DateRangePickerRoot,
  Separator: DateRangePickerSeparator,
});
