"use client";
/** HeroUI v3.2.6 derived work. Copyright NextUI Inc. Apache-2.0. Modified for Lenso. */
import { createContext, use, useRef, useState, type ReactNode, type RefObject } from "react";
import { CalendarStateContext } from "react-aria-components/Calendar";
import { RangeCalendarStateContext } from "react-aria-components/RangeCalendar";
export interface YearPickerContextValue {
  isYearPickerOpen: boolean;
  setIsYearPickerOpen: (open: boolean) => void;
  calendarRef: RefObject<HTMLDivElement | null>;
  calendarGridSlot: "calendar-grid" | "range-calendar-grid";
}
export const YearPickerContext = createContext<YearPickerContextValue | null>(null);
export function useYearPicker() {
  const context = use(YearPickerContext);
  if (!context) throw new Error("Year picker requires Calendar or RangeCalendar");
  return context;
}
export function useCalendarOrRangeState() {
  const calendar = use(CalendarStateContext);
  const range = use(RangeCalendarStateContext);
  const state = calendar ?? range;
  if (!state) throw new Error("Calendar part requires Calendar or RangeCalendar");
  return state;
}
export type YearPickerOptions = {
  isYearPickerOpen?: boolean | undefined;
  defaultYearPickerOpen?: boolean | undefined;
  onYearPickerOpenChange?: ((open: boolean) => void) | undefined;
};
export function YearPickerProvider({
  children,
  isYearPickerOpen,
  defaultYearPickerOpen = false,
  onYearPickerOpenChange,
  range = false,
}: YearPickerOptions & { children: ReactNode; range?: boolean }) {
  const [open, setOpen] = useState(defaultYearPickerOpen);
  const calendarRef = useRef<HTMLDivElement | null>(null);
  return (
    <YearPickerContext
      value={{
        calendarRef,
        calendarGridSlot: range ? "range-calendar-grid" : "calendar-grid",
        isYearPickerOpen: isYearPickerOpen ?? open,
        setIsYearPickerOpen: (next) => {
          if (isYearPickerOpen === undefined) setOpen(next);
          onYearPickerOpenChange?.(next);
        },
      }}
    >
      {children}
    </YearPickerContext>
  );
}
