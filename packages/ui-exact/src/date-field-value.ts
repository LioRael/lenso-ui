import {
  createCalendar,
  DateFormatter,
  parseDate,
  toCalendar,
  getMinimumDayInMonth,
  getMinimumMonthInYear,
  type CalendarDate,
  type CalendarIdentifier,
} from "@internationalized/date";
export type DatePart = "year" | "month" | "day" | "era";
export interface DateSegment {
  key: string;
  type: DatePart | "literal";
  text: string;
  value: number;
  min: number;
  max: number;
  label: string;
}
export function dateModel(value: string, locale: string, calendar: string, placeholder: string) {
  const identifier = calendar || new DateFormatter(locale).resolvedOptions().calendar;
  const calendars: readonly string[] = [
    "gregory",
    "buddhist",
    "chinese",
    "coptic",
    "dangi",
    "ethioaa",
    "ethiopic",
    "hebrew",
    "indian",
    "islamic",
    "islamic-umalqura",
    "islamic-tbla",
    "islamic-civil",
    "islamic-rgsa",
    "iso8601",
    "japanese",
    "persian",
    "roc",
  ];
  if (!calendars.includes(identifier)) throw new RangeError(`Unknown date calendar: ${identifier}`);
  const date = toCalendar(
    parseDate(value || placeholder),
    createCalendar(identifier as CalendarIdentifier),
  );
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    calendar: date.calendar.identifier,
    timeZone: "UTC",
  };
  if (date.calendar.getEras().length > 1 && date.era !== date.calendar.getEras().at(-1))
    options.era = "short";
  const formatter = new DateFormatter(locale, options),
    names = new Intl.DisplayNames(locale, { type: "dateTimeField" });
  let literal = 0;
  const segments: DateSegment[] = formatter
    .formatToParts(date.toDate("UTC"))
    .flatMap<DateSegment>((part) => {
      if (part.type === "literal")
        return [
          {
            key: `literal-${literal++}`,
            type: "literal" as const,
            text: part.value,
            value: 0,
            min: 0,
            max: 0,
            label: "",
          },
        ];
      if (!["year", "month", "day", "era"].includes(part.type)) return [];
      const type = part.type as DatePart,
        range = dateRange(date, type);
      return [
        {
          key: type,
          type,
          text: part.value,
          value: type === "era" ? date.calendar.getEras().indexOf(date.era) : date[type],
          ...range,
          label: names.of(type) ?? type,
        },
      ];
    });
  return {
    date,
    segments,
    layout: segments.map((p) => p.key).join("|"),
    number: new Intl.NumberFormat(locale, { useGrouping: false }),
    segmentNumber: (type: DatePart, value: number) =>
      new Intl.NumberFormat(locale, {
        useGrouping: false,
        minimumIntegerDigits:
          formatter.resolvedOptions()[type as "year" | "month" | "day"] === "2-digit" ? 2 : 1,
      }).format(value),
  };
}
export function dateRange(date: CalendarDate, type: DatePart) {
  switch (type) {
    case "era":
      return { min: 0, max: date.calendar.getEras().length - 1 };
    case "year":
      return { min: 1, max: date.calendar.getYearsInEra(date) };
    case "month":
      return { min: getMinimumMonthInYear(date), max: date.calendar.getMonthsInYear(date) };
    case "day":
      return { min: getMinimumDayInMonth(date), max: date.calendar.getDaysInMonth(date) };
  }
}
export function setDatePart(date: CalendarDate, type: DatePart, value: number) {
  const range = dateRange(date, type),
    next = Math.min(range.max, Math.max(range.min, Math.trunc(value)));
  return type === "era"
    ? date.set({ era: date.calendar.getEras()[next]! })
    : date.set({ [type]: next });
}
export function dateNumber(text: string, locale: string) {
  const format = new Intl.NumberFormat(locale, { useGrouping: false });
  let value = text.replace(/[\u200e\u200f\u061c\s]/g, "");
  for (let i = 0; i < 10; i++) value = value.split(format.format(i)).join(String(i));
  return /^\d+$/.test(value) ? Number(value) : undefined;
}
export function dateInvalid(value: string, min: string, max: string) {
  if (!value) return false;
  const date = parseDate(value);
  return Boolean(
    (min && date.compare(parseDate(min)) < 0) || (max && date.compare(parseDate(max)) > 0),
  );
}
