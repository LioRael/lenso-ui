// Year/era list adapts Lenso's calendarYears, React Aria 3.52.1, Copyright 2026 Adobe, Apache-2.0.
import { DateFormatter, isSameYear, startOfYear } from "@internationalized/date";
import { calendarMonth, calendarDate, type CalendarOptions } from "./calendar-value.js";
export function calendarYears(options: CalendarOptions, visibleYears: number) {
  if (!Number.isSafeInteger(visibleYears) || visibleYears < 0)
    throw new RangeError("visibleYears must be a nonnegative integer");
  const model = calendarMonth(options);
  let count = visibleYears;
  if (!count) {
    let date = startOfYear(model.min);
    while (date.compare(model.max) <= 0) {
      count++;
      const next = startOfYear(date.add({ years: 1 }));
      if (next.compare(date) <= 0) break;
      date = next;
    }
  }
  let min = model.date.subtract({ years: Math.floor(count / 2) }),
    max = model.date.add({ years: Math.ceil(count / 2) - 1 });
  if (max.compare(model.max) > 0) {
    max = model.max;
    min = max.subtract({ years: count - 1 });
  }
  if (min.compare(model.min) < 0) {
    min = model.min;
    max = min.add({ years: count - 1 });
    if (max.compare(model.max) > 0) max = model.max;
  }
  const format = new DateFormatter(options.locale, {
    year: "numeric",
    calendar: model.date.calendar.identifier,
    timeZone: "UTC",
    ...(model.date.era === "BC" ? { era: "short" as const } : {}),
  });
  const current = options.today ? calendarDate(options.today, options) : undefined;
  const items = [];
  let date = min;
  while (date.compare(max) <= 0) {
    items.push({
      id: date.toString(),
      date,
      label: format.format(date.toDate("UTC")),
      selected: isSameYear(date, model.date),
      current: current ? isSameYear(date, current) : false,
    });
    const next = date.add({ years: 1 });
    if (next.compare(date) <= 0) break;
    date = next;
  }
  return {
    items,
    layout: items.map((i) => i.id).join("|"),
    selected: Math.max(
      0,
      items.findIndex((i) => i.selected),
    ),
    label: new Intl.DisplayNames(options.locale, { type: "dateTimeField" }).of("year") ?? "Year",
  };
}
