import { test, expect } from "bun:test";
import { calendarYears } from "../src/calendar-years";
import type { CalendarOptions } from "../src/calendar-value";
const options: CalendarOptions = {
  value: ["2024-02-29"],
  focused: "2024-02-29",
  placeholder: "2024-02-29",
  today: "2024-02-15",
  locale: "en-US",
  calendar: "",
  firstDay: "",
  min: "",
  max: "",
  unavailable: [],
};
// Month-grid tests cannot catch year/era window bounds or leap-day stepping through a year list.
test("year list retains source centered window and leap-date stepping", () => {
  const m = calendarYears(options, 20);
  expect(m.items.length).toBe(20);
  expect(m.items[0]!.date.year).toBe(2014);
  expect(m.items.at(-1)!.date.year).toBe(2033);
  expect(m.items[m.selected]!.date.year).toBe(2024);
  expect(m.items[m.selected]!.current).toBe(true);
  expect(m.items.find((i) => i.date.year === 2025)!.date.toString()).toBe("2025-02-28");
  expect(m.label).toBe("year");
});
test("source bounded year list includes all default years and clamps narrow bounds", () => {
  const all = calendarYears(options, 0);
  expect(all.items.length).toBe(200);
  expect(all.items[0]!.date.year).toBe(1900);
  expect(all.items.at(-1)!.date.year).toBe(2099);
  const small = calendarYears({ ...options, min: "2023-03-01", max: "2025-05-31" }, 20);
  expect(small.items.map((i) => i.date.year)).toEqual([2023, 2024, 2025]);
  expect(small.items[0]!.date.toString()).toBe("2023-03-01");
  const fa = calendarYears({ ...options, locale: "fa-IR" }, 20);
  expect(fa.items[fa.selected]!.date.year).toBe(1402);
  expect(fa.items[fa.selected]!.label).toBe("۱۴۰۲");
  expect(() => calendarYears(options, -1)).toThrow();
  expect(() => calendarYears(options, 1.5)).toThrow();
});
