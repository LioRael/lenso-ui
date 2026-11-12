import * as stylex from "@stylexjs/stylex";
import { inputOTPStyles as s } from "@lenso/tokens/input-otp";
import { liquidMaterialStyles } from "@lenso/tokens/materials";
import { glassStyles } from "@lenso/tokens/glass";
import type { StyleInput } from "./style-types.js";
const native = stylex.create({
  slot: { ":is(#exact-root *)": { borderWidth: 0, borderRadius: 999, "--exact-curve": "round" } },
});
const parts = new Map<string, StyleInput>([
  ["input-otp", [s.root]],
  ["input-otp-group", [s.group]],
  ["input-otp-separator", [s.separator]],
]);
export const otpKinds = [...parts.keys()];
export function otpPresentation(kind: string, data: DOMStringMap): StyleInput | undefined {
  if (kind !== "input-otp-slot") return parts.get(kind);
  if (data["lensoVariant"] !== "primary" && data["lensoVariant"] !== "secondary")
    throw new RangeError(`Unknown InputOTP variant: ${data["lensoVariant"]}`);
  const glass = data["lensoGlass"] === "true";
  return [
    glass && liquidMaterialStyles.small,
    s.slot,
    !glass && data["lensoVariant"] === "secondary" && s.secondary,
    glass && s.glass,
    glass && glassStyles.optics,
    native.slot,
  ];
}
