import {
  CalendarDate,
  DateFormatter,
  parseTime,
  toCalendarDateTime,
  toTime,
  type CalendarDateTime,
} from "@internationalized/date";
export type TimePart = "hour" | "minute" | "second" | "dayPeriod";
export function timeModel(
  value: string,
  locale: string,
  hourCycle: string,
  granularity: string,
  placeholder: string,
) {
  if (!["", "h11", "h12", "h23", "h24"].includes(hourCycle))
    throw new RangeError(`Unknown hour cycle: ${hourCycle}`);
  if (!["hour", "minute", "second"].includes(granularity))
    throw new RangeError(`Unknown time granularity: ${granularity}`);
  const time = parseTime(value || placeholder);
  const date = toCalendarDateTime(new CalendarDate(2000, 1, 1), time);
  const formatter = new DateFormatter(locale, {
    hour: "numeric",
    minute: granularity === "hour" ? undefined : "2-digit",
    second: granularity === "second" ? "2-digit" : undefined,
    hourCycle: (hourCycle || undefined) as Intl.DateTimeFormatOptions["hourCycle"],
    timeZone: "UTC",
  });
  const cycle = formatter.resolvedOptions().hourCycle ?? "h23";
  const names = new Intl.DisplayNames(locale, { type: "dateTimeField" });
  let literal = 0;
  const segments = formatter.formatToParts(date.toDate("UTC")).flatMap((part) => {
    if (!["literal", "hour", "minute", "second", "dayPeriod"].includes(part.type)) return [];
    const type = part.type as TimePart | "literal";
    return [
      {
        key: type === "literal" ? `literal-${literal++}` : type,
        type,
        text: part.value,
        label: type === "literal" ? "" : (names.of(type) ?? type),
      },
    ];
  });
  const periods = [0, 12].map(
    (hour) =>
      formatter.formatToParts(date.set({ hour }).toDate("UTC")).find((p) => p.type === "dayPeriod")
        ?.value ?? "",
  );
  return {
    date,
    segments,
    hourCycle: cycle,
    periods,
    layout: segments.map((p) => p.key).join("|"),
    segmentNumber: (type: TimePart, value: number) =>
      type === "dayPeriod"
        ? periods[value]!
        : new Intl.NumberFormat(locale, {
            useGrouping: false,
            minimumIntegerDigits: formatter.resolvedOptions()[type] === "2-digit" ? 2 : 1,
          }).format(value),
  };
}
export function timeValue(date: CalendarDateTime) {
  return toTime(date).toString();
}
export function timeInvalid(value: string, min: string, max: string) {
  if (!value) return false;
  const time = parseTime(value);
  return Boolean(
    (min && time.compare(parseTime(min)) < 0) || (max && time.compare(parseTime(max)) > 0),
  );
}
