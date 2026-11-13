"use client";
import type { ChangeOptions, ChangeSource } from "@ui-sdk/core";
import type { ModelChangeReason } from "@lenso/primitives/model-control";
import { createContext } from "react";
import type { DatePickerState } from "react-stately/useDatePickerState";
import type { DateRangePickerState } from "react-stately/useDateRangePickerState";
import type { DateValue } from "react-stately/useDateFieldState";
import type { CalendarProps } from "react-stately/useCalendarState";
import type { RangeCalendarProps } from "react-stately/useRangeCalendarState";
type SelectionOptions = ChangeOptions<ModelChangeReason> & { source?: ChangeSource };
export const PickerDateContext = createContext<{
  model: Omit<DatePickerState, "isOpen" | "setOpen" | "open" | "close" | "toggle">;
  calendarProps: Pick<
    CalendarProps<DateValue>,
    "minValue" | "maxValue" | "isDisabled" | "isReadOnly" | "isDateUnavailable" | "firstDayOfWeek"
  >;
  select(date: DateValue | null, options?: SelectionOptions): boolean | undefined;
} | null>(null);
export const PickerRangeContext = createContext<{
  model: Omit<DateRangePickerState, "isOpen" | "setOpen" | "open" | "close" | "toggle">;
  calendarProps: Pick<
    RangeCalendarProps<DateValue>,
    | "minValue"
    | "maxValue"
    | "isDisabled"
    | "isReadOnly"
    | "isDateUnavailable"
    | "firstDayOfWeek"
    | "allowsNonContiguousRanges"
  >;
  select(
    value: { start: DateValue; end: DateValue } | null,
    options?: SelectionOptions,
  ): boolean | undefined;
} | null>(null);
