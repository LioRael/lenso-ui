import { test, expect } from "bun:test";
import { calendarMonth, calendarTarget, type CalendarOptions } from "../src/calendar-value";
const options: CalendarOptions = {
  value: ["2024-02-29"],
  focused: "2024-02-29",
  placeholder: "2024-02-01",
  today: "2024-02-15",
  locale: "en-US",
  calendar: "",
  firstDay: "",
  min: "",
  max: "",
  unavailable: ["2024-02-20"],
};
// Segmented date tests do not cover complete week boundaries, outside cells or month navigation.
test("calendar month generates complete localized weeks and stable ISO identities", () => {
  const us = calendarMonth(options),
    gb = calendarMonth({ ...options, locale: "en-GB" });
  expect(us.rows.length).toBe(5);
  expect(us.cells.length).toBe(35);
  expect(us.cells[0]!.iso).toBe("2024-01-28");
  expect(gb.cells[0]!.iso).toBe("2024-01-29");
  expect(us.cells.find((c) => c.iso === "2024-02-29")?.selected).toBe(true);
  expect(us.cells.find((c) => c.iso === "2024-02-15")?.today).toBe(true);
  expect(us.cells.find((c) => c.iso === "2024-02-20")?.unavailable).toBe(true);
  expect(us.cells[0]!.outside).toBe(true);
  expect(us.weekdays[0]!.label).toBe("Sunday");
  expect(gb.weekdays[0]!.label).toBe("Monday");
  const short = calendarMonth({ ...options, focused: "2026-02-01" });
  expect(short.rows.length).toBe(4);
  const fa = calendarMonth({ ...options, locale: "fa-IR" });
  expect(fa.date.year).toBe(1402);
  expect(fa.cells.find((c) => c.iso === "2024-02-29")?.text).toBe("۱۰");
  expect(fa.layout.includes("2024-02-29")).toBe(true);
  const narrow = calendarMonth({ ...options, locale: "fa-IR", weekdayStyle: "narrow" });
  expect(narrow.weekdays.every((day) => [...day.text].length < 3)).toBe(true);
});
test("calendar navigation uses calendar month/year and locale week boundaries", () => {
  const m = calendarMonth(options);
  expect(calendarTarget(m.date, "ArrowRight", false, options, "ltr")?.toString()).toBe(
    "2024-03-01",
  );
  expect(calendarTarget(m.date, "ArrowRight", false, options, "rtl")?.toString()).toBe(
    "2024-02-28",
  );
  expect(calendarTarget(m.date, "Home", false, options, "ltr")?.toString()).toBe("2024-02-25");
  expect(calendarTarget(m.date, "End", false, options, "ltr")?.toString()).toBe("2024-03-02");
  expect(calendarTarget(m.date, "PageUp", true, options, "ltr")?.toString()).toBe("2023-02-28");
  expect(calendarTarget(m.date, "PageDown", false, options, "ltr")?.toString()).toBe("2024-03-29");
  expect(calendarTarget(m.date, "Tab", false, options, "ltr")).toBeUndefined();
});
test("calendar constraints disable dates and page boundaries without changing selection", () => {
  const m = calendarMonth({ ...options, min: "2024-02-10", max: "2024-02-25" });
  expect(m.previous).toBe(false);
  expect(m.next).toBe(false);
  expect(m.cells.find((c) => c.iso === "2024-02-09")?.disabled).toBe(true);
  expect(m.cells.find((c) => c.iso === "2024-02-10")?.disabled).toBe(false);
  expect(m.cells.find((c) => c.iso === "2024-02-29")?.selected).toBe(true);
  expect(() => calendarMonth({ ...options, min: "2024-03-01", max: "2024-02-01" })).toThrow();
  expect(() => calendarMonth({ ...options, firstDay: "weekend" })).toThrow();
});
