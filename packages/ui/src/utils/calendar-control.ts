import { toCalendarDate, startOfWeek, endOfWeek } from "@internationalized/date";
import { isRTL } from "@ui-sdk/core";
import { decodeDate } from "./date-values.js";
import type { NativeCalendarState } from "./calendar-state.js";
export function moveCalendarFocus(
  event: KeyboardEvent,
  from: string,
  model: NativeCalendarState,
  locale: string,
  firstDayOfWeek?: "sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat",
) {
  const date = toCalendarDate(decodeDate(from, model.focusedDate)!);
  const rtl = event.target instanceof HTMLElement && isRTL(event.target);
  const move = {
    ArrowRight: () => date.add({ days: rtl ? -1 : 1 }),
    ArrowLeft: () => date.add({ days: rtl ? 1 : -1 }),
    ArrowDown: () => date.add({ days: 7 }),
    ArrowUp: () => date.subtract({ days: 7 }),
    PageDown: () => date.add(event.shiftKey ? { years: 1 } : { months: 1 }),
    PageUp: () => date.subtract(event.shiftKey ? { years: 1 } : { months: 1 }),
    Home: () => startOfWeek(date, locale, firstDayOfWeek),
    End: () => endOfWeek(date, locale, firstDayOfWeek),
  }[event.key];
  if (!move) return;
  let next = move();
  if (model.minValue && next.compare(model.minValue) < 0) next = toCalendarDate(model.minValue);
  if (model.maxValue && next.compare(model.maxValue) > 0) next = toCalendarDate(model.maxValue);
  model.setFocusedDate(next);
  return next.toString();
}
