import {
  DateFormatter,
  endOfMonth,
  endOfWeek,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  type CalendarDate,
  type DayOfWeek,
} from "@internationalized/date";
import { dateModel } from "./date-field-value.js";
export interface CalendarOptions {
  value: string[];
  focused: string;
  placeholder: string;
  locale: string;
  calendar: string;
  firstDay: string;
  weekdayStyle?: "narrow" | "short" | "long";
  min: string;
  max: string;
  unavailable: string[];
  today: string;
}
export function calendarDate(
  value: string,
  options: Pick<CalendarOptions, "locale" | "calendar" | "placeholder">,
) {
  return dateModel(value, options.locale, options.calendar, options.placeholder).date;
}
export function calendarBounds(options: CalendarOptions) {
  const date = calendarDate(options.focused || options.value[0] || options.placeholder, options);
  const offsets: Record<string, number> = {
    buddhist: 543,
    ethiopic: -8,
    ethioaa: -8,
    coptic: -284,
    hebrew: 3760,
    indian: -78,
    "islamic-civil": -579,
    "islamic-tbla": -579,
    "islamic-umalqura": -579,
    persian: -600,
  };
  const offset = offsets[date.calendar.identifier] ?? 0;
  return {
    min: options.min
      ? calendarDate(options.min, options)
      : date.set({ year: 1900 + offset, month: 1, day: 1 }),
    max: options.max
      ? calendarDate(options.max, options)
      : date.set({ year: 2099 + offset, month: 12, day: 31 }),
  };
}
export function calendarMonth(options: CalendarOptions) {
  const days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  if (options.firstDay && !days.includes(options.firstDay))
    throw new RangeError(`Unknown first day: ${options.firstDay}`);
  const firstDay = (options.firstDay || undefined) as DayOfWeek | undefined;
  const date = calendarDate(options.focused || options.value[0] || options.placeholder, options),
    start = startOfMonth(date),
    end = endOfMonth(date);
  const first = startOfWeek(start, options.locale, firstDay),
    last = endOfWeek(end, options.locale, firstDay);
  const { min, max } = calendarBounds(options);
  if (min.compare(max) > 0) throw new RangeError("Calendar minimum exceeds maximum");
  const format = new DateFormatter(options.locale, {
    calendar: date.calendar.identifier,
    timeZone: "UTC",
    month: "long",
    year: "numeric",
    ...(date.era === "BC" ? { era: "short" as const } : {}),
  });
  const label = new DateFormatter(options.locale, {
    calendar: date.calendar.identifier,
    timeZone: "UTC",
    dateStyle: "full",
  });
  if (options.weekdayStyle && !["narrow", "short", "long"].includes(options.weekdayStyle))
    throw new RangeError("Unknown weekday style");
  const weekday = new DateFormatter(options.locale, {
    weekday: options.weekdayStyle ?? "short",
    timeZone: "UTC",
  });
  const weekdayLong = new DateFormatter(options.locale, { weekday: "long", timeZone: "UTC" });
  const number = new Intl.NumberFormat(options.locale, { useGrouping: false });
  const cells = [];
  let current = first;
  while (current.compare(last) <= 0) {
    const iso = current.toString();
    cells.push({
      date: current,
      iso,
      label: label.format(current.toDate("UTC")),
      text: number.format(current.day),
      outside: !isSameMonth(current, start),
      disabled: current.compare(min) < 0 || current.compare(max) > 0,
      unavailable: options.unavailable.includes(iso),
      selected: options.value.includes(iso),
      today: iso === options.today,
    });
    const next = current.add({ days: 1 });
    if (next.compare(current) <= 0) break;
    current = next;
  }
  const rows = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
  const formattable = date.calendar.getFormattableMonth?.(start) ?? start;
  return {
    date,
    start,
    end,
    min,
    max,
    cells,
    rows,
    layout: rows.map((row) => row.map((c) => c.iso).join("|")).join("~"),
    heading: format.format(formattable.toDate("UTC")),
    weekdays: Array.from({ length: 7 }, (_, i) => {
      const date = first.add({ days: i }).toDate("UTC");
      return { text: weekday.format(date), label: weekdayLong.format(date) };
    }),
    previous: start.subtract({ days: 1 }).compare(min) >= 0,
    next: end.add({ days: 1 }).compare(max) <= 0,
  };
}
export function calendarTarget(
  date: CalendarDate,
  key: string,
  shift: boolean,
  options: CalendarOptions,
  direction: string,
) {
  const delta = {
    ArrowRight: direction === "rtl" ? -1 : 1,
    ArrowLeft: direction === "rtl" ? 1 : -1,
    ArrowUp: -7,
    ArrowDown: 7,
  }[key];
  if (delta !== undefined) return date.add({ days: delta });
  if (key === "PageUp") return date.subtract(shift ? { years: 1 } : { months: 1 });
  if (key === "PageDown") return date.add(shift ? { years: 1 } : { months: 1 });
  if (key === "Home")
    return startOfWeek(
      date,
      options.locale,
      (options.firstDay || undefined) as DayOfWeek | undefined,
    );
  if (key === "End")
    return endOfWeek(
      date,
      options.locale,
      (options.firstDay || undefined) as DayOfWeek | undefined,
    );
  return undefined;
}
