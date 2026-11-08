"use client";
import { createContext, use } from "react";
import type { CalendarState, CalendarSelectionMode } from "react-stately/useCalendarState";
import type { RangeCalendarState } from "react-stately/useRangeCalendarState";
import { toCalendar, toCalendarDate, isSameYear, type DateDuration } from "@internationalized/date";
export type NativeCalendarState = CalendarState<CalendarSelectionMode> | RangeCalendarState;
export const CalendarStateContext = createContext<NativeCalendarState | null>(null);
export function useNativeCalendarState() {
  const state = use(CalendarStateContext);
  if (!state) throw new Error("Calendar parts require Calendar or RangeCalendar");
  return state;
}
export type CalendarHeadingFormat = Pick<
  Intl.DateTimeFormatOptions,
  "day" | "month" | "year" | "era"
>;
export function calendarHeading(
  state: NativeCalendarState,
  locale: string,
  { format, offset }: { format?: CalendarHeadingFormat; offset?: DateDuration } = {},
) {
  const start = offset ? state.visibleRange.start.add(offset) : state.visibleRange.start;
  const days = state.visibleDuration.days || state.visibleDuration.weeks;
  const formatter = new Intl.DateTimeFormat(locale, {
    calendar: start.calendar.identifier,
    timeZone: state.timeZone,
    day: days ? "numeric" : undefined,
    month: "long",
    year: "numeric",
    ...(start.era === "BC" ? { era: "short" } : {}),
    ...format,
  });
  const formattable = start.calendar.getFormattableMonth?.(start) ?? start;
  return days
    ? formatter.formatRange(
        start.toDate(state.timeZone),
        state.visibleRange.end.toDate(state.timeZone),
      )
    : formatter.format(formattable.toDate(state.timeZone));
}

// Year/era list adapted from React Aria 3.52.1, Copyright 2026 Adobe, Apache-2.0.
export function calendarYears(
  state: NativeCalendarState,
  locale: string,
  count: number,
  format?: Pick<Intl.DateTimeFormatOptions, "year" | "era">,
) {
  let min = state.focusedDate.subtract({ years: Math.floor(count / 2) });
  let max = state.focusedDate.add({ years: Math.ceil(count / 2) - 1 });
  if (state.maxValue && max.compare(state.maxValue) > 0) {
    max = toCalendar(toCalendarDate(state.maxValue), state.focusedDate.calendar);
    min = max.subtract({ years: count - 1 });
  }
  if (state.minValue && min.compare(state.minValue) < 0) {
    min = toCalendar(toCalendarDate(state.minValue), state.focusedDate.calendar);
    max = min.add({ years: count - 1 });
    if (state.maxValue && max.compare(state.maxValue) > 0)
      max = toCalendar(toCalendarDate(state.maxValue), state.focusedDate.calendar);
  }
  const formatter = new Intl.DateTimeFormat(locale, {
    year: "numeric",
    calendar: state.focusedDate.calendar.identifier,
    timeZone: state.timeZone,
    ...(state.focusedDate.era === "BC" ? { era: "short" } : {}),
    ...format,
  });
  const items: { id: number; date: typeof state.focusedDate; formatted: string }[] = [];
  let date = min;
  while (date.compare(max) <= 0) {
    items.push({
      id: items.length,
      date,
      formatted: formatter.format(date.toDate(state.timeZone)),
    });
    const next = date.add({ years: 1 });
    if (next.compare(date) <= 0) break;
    date = next;
  }
  const selected = items.findIndex((item) => isSameYear(item.date, state.focusedDate));
  return {
    items,
    value: Math.max(0, selected),
    onChange(index: number) {
      const item = items[index];
      if (item) state.setFocusedDate(item.date);
    },
    "aria-label": new Intl.DisplayNames(locale, { type: "dateTimeField" }).of("year"),
  };
}
