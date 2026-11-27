import type { yearPicker } from "@lenso/primitives/model-control";
import type { CalendarController, CalendarState } from "@ui-sdk/svelte/calendar";
import type { CollapsibleController } from "@ui-sdk/svelte/collapsible";
import type { PrimitiveHandle } from "@ui-sdk/svelte/primitive";
import { createOptionalContext } from "../context.js";

export const [getYearPicker, setYearPicker] = createOptionalContext<{
  state: () => CalendarState;
  open: () => boolean;
  ready: () => boolean;
  mountGrid: () => () => void;
  locale: () => string | undefined;
  bounds: () => { min?: string; max?: string };
  calendar: () => CalendarController;
  disclosure: CollapsibleController;
}>();

export const [getYearGrid, setYearGrid] = createOptionalContext<{
  items: () => readonly { year: number; formatted: string }[];
  selected: () => number;
  open: () => boolean;
  disabled: () => boolean;
  model: PrimitiveHandle<typeof yearPicker>;
  state: () => ReturnType<typeof yearPicker>["types"]["state"];
  select: (year: number, event?: Event) => void;
}>();

export function yearDate(year: number, month = 0) {
  const date = new Date(0);
  date.setUTCFullYear(year, month, 1);
  return date;
}

export type WithChildren<Props, Content> = {
  [Key in keyof Props as Key extends "children" ? never : Key]: Props[Key];
} & { children?: Content };

export const YearPickerContext = { get: getYearPicker, set: setYearPicker };
export function useYearPicker() {
  const context = getYearPicker();
  if (!context) throw new Error("Year picker requires Calendar or RangeCalendar");
  return {
    controller: context.disclosure,
    get isYearPickerOpen() {
      return context.open();
    },
    setIsYearPickerOpen: context.disclosure.setOpen,
  };
}
export function useCalendarOrRangeState() {
  const context = getYearPicker();
  if (!context) throw new Error("Calendar state requires Calendar or RangeCalendar");
  return context.state;
}
