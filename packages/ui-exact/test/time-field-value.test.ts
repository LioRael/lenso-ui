import { test, expect } from "bun:test";
import { IncompleteDate } from "../src/date-incomplete";
import { timeModel, timeValue, timeInvalid } from "../src/time-field-value";
// Date-only coverage cannot catch midnight/noon mapping, hidden seconds or localized day periods.
test("time display preserves scalar time across hour cycles and precision", () => {
  for (const cycle of ["h11", "h12", "h23", "h24"])
    for (const value of ["00:00:00", "12:00:00", "23:59:58"]) {
      const m = timeModel(value, "en-US", cycle, "second", "09:15");
      const d = new IncompleteDate(m.date.calendar, m.hourCycle, m.date);
      expect(timeValue(d.toValue(m.date) as typeof m.date)).toBe(value);
      expect(d.isComplete(m.segments.filter((p) => p.type !== "literal").map((p) => p.type))).toBe(
        true,
      );
    }
  const m = timeModel("13:45:30", "en-US", "h12", "minute", "09:15");
  expect(m.segments.filter((p) => p.type !== "literal").map((p) => p.type)).toEqual([
    "hour",
    "minute",
    "dayPeriod",
  ]);
  expect(m.periods).toEqual(["AM", "PM"]);
  expect(m.segmentNumber("hour", 1)).toBe("1");
  const arabic = timeModel("13:45:30", "ar-EG", "h12", "second", "09:15");
  expect(arabic.segmentNumber("minute", 45)).toBe("٤٥");
  expect(arabic.periods.every(Boolean)).toBe(true);
});
test("time drafts preserve minutes and source hour period cycling", () => {
  const m = timeModel("13:45:30", "en-US", "h12", "second", "09:15");
  let d = new IncompleteDate(m.date.calendar, m.hourCycle, m.date).clear("hour");
  expect(d.minute).toBe(45);
  expect(d.isComplete(["hour", "minute", "second", "dayPeriod"])).toBe(false);
  d = d.set("hour", 12, m.date).set("dayPeriod", 0, m.date);
  expect(timeValue(d.toValue(m.date) as typeof m.date)).toBe("00:45:30");
  d = d.cycle("dayPeriod", 1, m.date, ["hour", "minute", "second", "dayPeriod"]);
  expect(timeValue(d.toValue(m.date) as typeof m.date)).toBe("12:45:30");
  const blank = new IncompleteDate(m.date.calendar, m.hourCycle);
  expect(blank.cycle("minute", 1, m.date, ["hour", "minute"]).minute).toBe(45);
});
test("time constraints use numeric time identity and reject invalid configuration", () => {
  expect(timeInvalid("09:30", "10:00", "")).toBe(true);
  expect(timeInvalid("18:01", "", "18:00")).toBe(true);
  expect(timeInvalid("12:00", "09:00", "18:00")).toBe(false);
  expect(() => timeModel("24:01", "en-US", "h23", "minute", "09:15")).toThrow();
  expect(() => timeModel("13:00", "en-US", "noon", "minute", "09:15")).toThrow();
  expect(() => timeModel("13:00", "en-US", "h23", "day", "09:15")).toThrow();
});
