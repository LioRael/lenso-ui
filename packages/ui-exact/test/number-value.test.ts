import { describe, expect, test } from "bun:test";
import { parseNumber } from "../src/number-parse.js";
import { removeFloatingPointErrors, toValidatedNumber } from "../src/number-value.js";

describe("NumberField value model", () => {
  test("locale punctuation and non-ASCII digits keep their numeric value", () => {
    expect(parseNumber("1.234,5", "de-DE")).toBe(1234.5);
    expect(parseNumber("١٢٫٥", "ar-EG")).toBe(12.5);
    expect(parseNumber("１２．５", "ja-JP")).toBe(12.5);
    expect(parseNumber("−12.5", "en-US")).toBe(-12.5);
  });
  test("display decorations do not leak into percent and currency values", () => {
    expect(parseNumber("25%", "en-US", { style: "percent" })).toBe(0.25);
    expect(parseNumber("1.234,50 €", "de-DE", { style: "currency", currency: "EUR" })).toBe(1234.5);
  });
  test("empty, partial signs and non-finite values never become zero", () => {
    for (const text of ["", "-", "+", "∞", "Infinity", "1e999"])
      expect(parseNumber(text, "en-US")).toBeNull();
    expect(toValidatedNumber(null, 1, -10, 10, -10, undefined, true, false, true)).toBeNull();
  });
  test("directional snapping leaves fractional bounds reachable", () => {
    expect(toValidatedNumber(0.4, 0.1, 0.6, 1.05, 0.6, undefined, true, false, true)).toBe(0.6);
    expect(toValidatedNumber(1.1, 0.1, 0.6, 1.05, 0.6, undefined, true, false, true)).toBe(1.05);
    expect(toValidatedNumber(0.74, 0.01, -0.05, 1, -0.05, undefined, true, true, true)).toBe(0.74);
  });
  test("step cleanup fixes binary noise without rounding entered precision", () => {
    expect(removeFloatingPointErrors(0.1 + 0.2)).toBe(0.3);
    const entered = Number("0.12345678901234567");
    expect(toValidatedNumber(entered, undefined, -10, 10, -10, undefined, false, false, true)).toBe(
      entered,
    );
    expect(toValidatedNumber(0.1 + 0.2, 0.1, -10, 10, -10, undefined, false, false, true)).toBe(
      0.3,
    );
  });
  test("format rounding is clamped after rounding, and out-of-range editing remains available", () => {
    expect(
      toValidatedNumber(
        0.64,
        undefined,
        0.6,
        0.65,
        0.6,
        { maximumFractionDigits: 1 },
        false,
        false,
        true,
      ),
    ).toBe(0.6);
    expect(toValidatedNumber(12, undefined, -10, 10, -10, undefined, false, false, false)).toBe(12);
  });
});
