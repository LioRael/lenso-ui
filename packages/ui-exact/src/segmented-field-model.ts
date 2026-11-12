import type { CalendarDate, CalendarDateTime } from "@internationalized/date";
import { dateModel, dateInvalid, type DatePart } from "./date-field-value.js";
import { timeModel, timeInvalid, timeValue, type TimePart } from "./time-field-value.js";
export type EditablePart = DatePart | TimePart;
export interface SegmentModel {
  date: CalendarDate | CalendarDateTime;
  hourCycle: "h11" | "h12" | "h23" | "h24";
  segments: { key: string; type: EditablePart | "literal"; text: string; label: string }[];
  layout: string;
  periods: string[];
  segmentNumber(type: EditablePart, value: number): string;
  serialize(date: CalendarDate | CalendarDateTime): string;
  invalid(value: string, min: string, max: string): boolean;
}
export function segmentedModel(data: DOMStringMap, value: string): SegmentModel {
  const locale = data["lensoLocale"] ?? "en-US";
  if (data["lensoTime"] === "true") {
    const model = timeModel(
      value,
      locale,
      data["lensoHourCycle"] ?? "",
      data["lensoGranularity"] ?? "minute",
      data["lensoPlaceholder"] ?? "00:00",
    );
    return {
      ...model,
      segmentNumber: (type, value) => model.segmentNumber(type as TimePart, value),
      serialize: (date) => timeValue(date as CalendarDateTime),
      invalid: timeInvalid,
    };
  }
  const model = dateModel(
    value,
    locale,
    data["lensoCalendar"] ?? "",
    data["lensoPlaceholder"] ?? "2000-01-01",
  );
  return {
    ...model,
    hourCycle: "h23",
    periods: [],
    segmentNumber: (type, value) => model.segmentNumber(type as DatePart, value),
    serialize: (date) => date.toString(),
    invalid: dateInvalid,
  };
}
