"use client";
// Adapted from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e), Apache-2.0.
import { InputOTP } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";

export const styles = stylex.create({
  field: { display: "flex", flexDirection: "column", gap: 8, width: 280, maxWidth: "100%" },
  heading: { display: "flex", flexDirection: "column", gap: 4 },
  muted: { fontSize: 14, color: "var(--muted)" },
  resend: { display: "flex", alignItems: "center", gap: 5, paddingInline: 4, paddingTop: 4 },
  link: { color: "var(--foreground)", textDecoration: "underline" },
  clear: { fontWeight: 500, color: "var(--foreground)", textDecoration: "underline" },
  variants: { display: "flex", flexDirection: "column", gap: 24 },
  surface: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    width: "100%",
    padding: 24,
    borderRadius: 24,
  },
  customWidth: { width: 288 },
  customSlot: {
    borderRadius: 8,
    borderColor: {
      default: "color-mix(in oklch, var(--border) 80%, transparent)",
      ":focus": "color-mix(in oklch, var(--accent) 40%, transparent)",
    },
    backgroundColor: { default: "var(--default)", ":focus": "var(--accent-soft)" },
  },
  separator: { backgroundColor: "var(--border)" },
  resendLink: { fontSize: 14, color: "var(--link)" },
  form: { display: "flex", flexDirection: "column", gap: 16, width: 280, maxWidth: "100%" },
  full: { width: "100%" },
  submit: { marginTop: 8, width: "100%" },
  help: { display: "flex", alignItems: "center", justifyContent: "center", gap: 4 },
});

export function Slots({ custom = false }: { custom?: boolean }) {
  return (
    <>
      <InputOTP.Group>
        <InputOTP.Slot aria-label="Digit 1" xstyle={custom && styles.customSlot} />
        <InputOTP.Slot aria-label="Digit 2" xstyle={custom && styles.customSlot} />
        <InputOTP.Slot aria-label="Digit 3" xstyle={custom && styles.customSlot} />
      </InputOTP.Group>
      <InputOTP.Separator xstyle={custom && styles.separator} />
      <InputOTP.Group>
        <InputOTP.Slot aria-label="Digit 4" xstyle={custom && styles.customSlot} />
        <InputOTP.Slot aria-label="Digit 5" xstyle={custom && styles.customSlot} />
        <InputOTP.Slot aria-label="Digit 6" xstyle={custom && styles.customSlot} />
      </InputOTP.Group>
    </>
  );
}
