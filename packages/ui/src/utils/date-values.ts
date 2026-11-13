import {
  parseDate,
  parseDateTime,
  parseZonedDateTime,
  parseTime,
  toCalendar,
  Time,
  type DateValue,
} from "@internationalized/date";
import type { TimeValue } from "react-stately/useTimeFieldState";
import type { ModelValue } from "@lenso/primitives/model-control";
export const encodeDate = (value: DateValue | null): ModelValue => value?.toString() ?? null;
export function decodeDate(value: ModelValue, template?: DateValue | null): DateValue | null {
  if (value === null) return null;
  if (typeof value !== "string") throw new Error("Expected an ISO date or date and time");
  const parsed = value.includes("[")
    ? parseZonedDateTime(value)
    : value.includes("T")
      ? parseDateTime(value)
      : parseDate(value);
  return template ? toCalendar(parsed, template.calendar) : parsed;
}
export const encodeTime = (value: TimeValue | null): ModelValue =>
  value ? new Time(value.hour, value.minute, value.second, value.millisecond).toString() : null;
export function decodeTime(value: ModelValue, template?: TimeValue | null): TimeValue | null {
  if (value === null) return null;
  if (typeof value !== "string") throw new Error("Expected an ISO time");
  const time = parseTime(value);
  return template
    ? template.set({
        hour: time.hour,
        minute: time.minute,
        second: time.second,
        millisecond: time.millisecond,
      })
    : time;
}
export type DateRangeValue = { start: DateValue; end: DateValue };
export const encodeRange = (value: DateRangeValue | null): ModelValue =>
  value ? [value.start.toString(), value.end.toString()] : null;
export function decodeRange(
  value: ModelValue,
  template?: DateRangeValue | null,
): DateRangeValue | null {
  if (value === null) return null;
  if (!Array.isArray(value) || value.length !== 2) throw new Error("Expected two ISO dates");
  return {
    start: decodeDate(value[0]!, template?.start)!,
    end: decodeDate(value[1]!, template?.end)!,
  };
}
