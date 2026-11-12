import { IncompleteDate } from "../src/date-incomplete";
import { test, expect } from "bun:test";
import { dateModel, setDatePart, dateInvalid, dateNumber } from "../src/date-field-value";
// Color/number tests cannot catch calendar conversion, leap-day clamping or localized date ordering.
test("date model preserves Gregorian identity through locale calendars and segment order", () => {
  const us = dateModel("2024-02-29", "en-US", "", "2026-11-12"),
    gb = dateModel("2024-02-29", "en-GB", "", "2026-11-12");
  expect(us.segments.filter((s) => s.type !== "literal").map((s) => s.type)).toEqual([
    "month",
    "day",
    "year",
  ]);
  expect(gb.segments.filter((s) => s.type !== "literal").map((s) => s.type)).toEqual([
    "day",
    "month",
    "year",
  ]);
  const persian = dateModel("2026-11-12", "fa-IR", "", "2026-11-12");
  expect(persian.date.year).toBe(1405);
  expect(persian.date.toString()).toBe("2026-11-12");
  expect(dateNumber("۱۴۰۵", "fa-IR")).toBe(1405);
  expect(dateNumber("١٢", "ar-EG")).toBe(12);
  expect(dateNumber("1x", "en-US")).toBeUndefined();
});
test("date editing uses calendar boundaries and strict ISO constraints", () => {
  const { date } = dateModel("2024-02-29", "en-US", "gregory", "2026-11-12");
  expect(setDatePart(date, "year", 2025).toString()).toBe("2025-02-28");
  expect(setDatePart(date, "month", 4).toString()).toBe("2024-04-29");
  expect(setDatePart(date, "day", 99).toString()).toBe("2024-02-29");
  expect(dateInvalid("2024-02-29", "2024-03-01", "")).toBe(true);
  expect(() => dateModel("2023-02-29", "en-US", "", "2026-11-12")).toThrow();
});

// CalendarDate normalization alone loses a leap-day draft before its year has been entered.
test("incomplete dates preserve leap-day intent until all fields are valid", () => {
  const { date } = dateModel("", "en-US", "gregory", "2026-11-12");
  let draft = new IncompleteDate(date.calendar, "h23").set("month", 2, date).set("day", 29, date);
  expect(draft.day).toBe(29);
  expect(draft.isComplete(["year", "month", "day"])).toBe(false);
  draft = draft.set("year", 2024, date);
  expect(draft.toValue(date).toString()).toBe("2024-02-29");
  expect(draft.validate(draft.toValue(date), ["year", "month", "day"])).toBe(true);
  draft = draft.set("year", 2025, date);
  expect(draft.day).toBe(29);
  expect(draft.toValue(date).toString()).toBe("2025-02-28");
  expect(draft.validate(draft.toValue(date), ["year", "month", "day"])).toBe(false);
  expect(draft.clear("month").day).toBe(29);
});
test("incomplete date cycling starts at the placeholder and keeps source page rounding", () => {
  const { date } = dateModel("2026-11-12", "en-US", "gregory", "2026-11-12");
  const draft = new IncompleteDate(date.calendar, "h23");
  expect(draft.cycle("day", 1, date, ["year", "month", "day"]).day).toBe(12);
  expect(
    new IncompleteDate(date.calendar, "h23", date).cycle("year", 5, date, ["year", "month", "day"])
      .year,
  ).toBe(2030);
});
