import { test, expect } from "bun:test";
import { otpNormalize, otpReplace, otpRemove, otpConfiguration } from "../src/input-otp-value";
// Collection/number tests do not cover OTP paste filtering or supplementary Unicode slot boundaries.
test("OTP paste normalization filters by the declared alphabet and retains leading zeros", () => {
  expect(otpNormalize(" 0 1x2\n3-45", 6, "numeric")).toBe("012345");
  expect(otpNormalize("a1B 2c!", 6, "alpha")).toBe("aBc");
  expect(otpNormalize("a1B 2c!", 4, "alphanumeric")).toBe("a1B2");
  expect(otpNormalize("雪 🦊é", 3, "none")).toBe("雪🦊é");
});
test("OTP replacement and deletion preserve contiguous characters and code-point boundaries", () => {
  expect(otpReplace("012345", 2, "89", 6, "numeric")).toBe("018945");
  expect(otpReplace("12", 5, "34", 6, "numeric")).toBe("1234");
  expect(otpReplace("雪🦊é", 1, "🌕", 3, "none")).toBe("雪🌕é");
  expect(otpRemove("雪🦊é", 1)).toBe("雪é");
  expect(otpRemove("123", 3)).toBe("123");
});
test("OTP rejects invalid lengths and validation modes before attaching interaction", () => {
  for (const length of [0, -1, 1.5, Infinity, 65])
    expect(() => otpConfiguration(length, "numeric")).toThrow(RangeError);
  expect(() => otpNormalize("123", 6, "numbers")).toThrow(RangeError);
});
