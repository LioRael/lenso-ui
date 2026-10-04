"use client";
/** HeroUI v3.2.6 derived work. Copyright NextUI Inc. Apache-2.0. Modified for StyleX and local RAC parts. */
import { DateRangePicker as Primitive } from "react-aria-components/DateRangePicker";
import type { DateValue } from "react-aria-components/Calendar";
import type { ComponentPropsWithRef } from "react";
import { dateRangePickerStyles as styles } from "@lenso/tokens/date-range-picker";
import * as stylex from "@stylexjs/stylex";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";
import {
  DatePickerTrigger,
  DatePickerTriggerIndicator,
  DatePickerPopover,
  DatePickerDialog,
  DatePickerLabel,
  DatePickerDescription,
  DatePickerError,
  PickerTriggerContext,
  usePickerFocusRestore,
} from "../date-picker/date-picker.js";

export type DateRangePickerRootProps<T extends DateValue> = StyleXProps<
  ComponentPropsWithRef<typeof Primitive<T>>
>;
export function DateRangePickerRoot<T extends DateValue>({
  onOpenChange,
  xstyle,
  style,
  ...props
}: DateRangePickerRootProps<T>) {
  const { setTrigger, handleOpenChange } = usePickerFocusRestore(onOpenChange);
  const compiled = stylex.props(styles.root, xstyle);
  return (
    <PickerTriggerContext value={setTrigger}>
      <Primitive<T>
        {...props}
        {...compiled}
        data-slot="date-range-picker"
        data-required={props.isRequired || undefined}
        style={mergeStyle(compiled.style, style)}
        onOpenChange={handleOpenChange}
      />
    </PickerTriggerContext>
  );
}
export function DateRangePickerRangeSeparator({
  children = " - ",
  xstyle,
  style,
  ...props
}: StyleXProps<ComponentPropsWithRef<"span">>) {
  const compiled = stylex.props(styles.separator, xstyle);
  return (
    <span
      aria-hidden="true"
      {...props}
      {...compiled}
      data-slot={props["data-slot"] ?? "date-range-picker-range-separator"}
      style={mergeStyle(compiled.style, style)}
    >
      {children}
    </span>
  );
}
export function DateRangePickerTrigger(
  props: StyleXProps<ComponentPropsWithRef<typeof DatePickerTrigger>>,
) {
  return <DatePickerTrigger {...props} data-slot="date-range-picker-trigger" />;
}
export function DateRangePickerTriggerIndicator(
  props: StyleXProps<ComponentPropsWithRef<typeof DatePickerTriggerIndicator>>,
) {
  return <DatePickerTriggerIndicator {...props} data-slot="date-range-picker-trigger-indicator" />;
}
export function DateRangePickerPopover(
  props: StyleXProps<ComponentPropsWithRef<typeof DatePickerPopover>>,
) {
  return <DatePickerPopover {...props} data-slot="date-range-picker-popover" />;
}
export {
  DatePickerDialog as DateRangePickerDialog,
  DatePickerLabel as DateRangePickerLabel,
  DatePickerDescription as DateRangePickerDescription,
  DatePickerError as DateRangePickerError,
};
