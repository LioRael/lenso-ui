import { test, expect } from "bun:test";
import { comboBoxFilter } from "../src/combo-box-filter";
// Compiler/control tests do not establish locale-sensitive matching of display labels.
test("combo filters retain Base UI accent/case matching and distinguish contains from prefix", () => {
  expect(comboBoxFilter("contains", "en-US")("Résumé", "resume")).toBe(true);
  expect(comboBoxFilter("contains", "en-US")("Solid", "LID")).toBe(true);
  expect(comboBoxFilter("startsWith", "en-US")("Solid", "lid")).toBe(false);
  expect(comboBoxFilter("none", "en-US")("React", "missing")).toBe(true);
});
test("combo matching follows the declared locale and refuses invalid configuration", () => {
  expect(comboBoxFilter("startsWith", "tr")("Istanbul", "ıst")).toBe(true);
  expect(comboBoxFilter("startsWith", "tr")("Istanbul", "ist")).toBe(false);
  expect(() => comboBoxFilter("fuzzy", "en-US")).toThrow(RangeError);
  expect(() => comboBoxFilter("contains", "en_US")).toThrow(RangeError);
});
