/** OTP value operations adapted from Base UI 1.9.0.
 * Copyright (c) 2019 Material-UI SAS. MIT License; see NOTICES.md.
 * Modified: explicit configuration errors and code-point-safe replacement/removal.
 */
export type OTPValidation = "numeric" | "alpha" | "alphanumeric" | "none";
const rejects = { numeric: /[^\d]/g, alpha: /[^a-zA-Z]/g, alphanumeric: /[^a-zA-Z0-9]/g };
export function otpConfiguration(
  length: number,
  validation: string,
): asserts validation is OTPValidation {
  if (!Number.isSafeInteger(length) || length < 1 || length > 64)
    throw new RangeError("InputOTP length must be an integer from 1 to 64");
  if (!["numeric", "alpha", "alphanumeric", "none"].includes(validation))
    throw new RangeError(`Unknown InputOTP validation: ${validation}`);
}
export function otpNormalize(raw: string, length: number, validation: string) {
  otpConfiguration(length, validation);
  const stripped = raw.replace(/\s/g, "");
  return [...(validation === "none" ? stripped : stripped.replace(rejects[validation], ""))]
    .slice(0, length)
    .join("");
}
export function otpReplace(
  value: string,
  index: number,
  raw: string,
  length: number,
  validation: string,
) {
  const inserted = [...otpNormalize(raw, length, validation)],
    current = [...value];
  return otpNormalize(
    [...current.slice(0, index), ...inserted, ...current.slice(index + inserted.length)].join(""),
    length,
    validation,
  );
}
export function otpRemove(value: string, index: number) {
  const chars = [...value];
  if (index < 0 || index >= chars.length) return value;
  return [...chars.slice(0, index), ...chars.slice(index + 1)].join("");
}
