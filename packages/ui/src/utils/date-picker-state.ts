"use client";
import { createContext } from "react";
import type { DatePickerState } from "react-stately/useDatePickerState";
import type { DateRangePickerState } from "react-stately/useDateRangePickerState";
import type { DateValue } from "react-stately/useDateFieldState";
import type { CalendarProps } from "react-stately/useCalendarState";
import type { RangeCalendarProps } from "react-stately/useRangeCalendarState";
export const PickerDateContext = createContext<{
  model: DatePickerState;
  calendarProps: Pick<
    CalendarProps<DateValue>,
    "minValue" | "maxValue" | "isDisabled" | "isReadOnly" | "isDateUnavailable" | "firstDayOfWeek"
  >;
  select(date: DateValue): void;
} | null>(null);
export const PickerRangeContext = createContext<{
  model: DateRangePickerState;
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
  select(value: { start: DateValue; end: DateValue }): void;
} | null>(null);
