"use client";
import { InputOTP } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";

export const styles = stylex.create({
  field: { display: "flex", flexDirection: "column", gap: 8, width: 328, maxWidth: "100%" },
  heading: { display: "flex", flexDirection: "column", gap: 4 },
  muted: { fontSize: 14, color: "var(--lenso-label-secondary)" },
  resend: { display: "flex", alignItems: "center", gap: 5, paddingInline: 4, paddingTop: 4 },
  link: { color: "var(--lenso-label-primary)", textDecoration: "underline" },
  clear: { fontWeight: 500, color: "var(--lenso-label-primary)", textDecoration: "underline" },
  variants: { display: "flex", flexDirection: "column", gap: 24 },
  materialScene: {
    width: "100%",
    maxWidth: 376,
    boxSizing: "border-box",
    padding: { default: 24, "@media (max-width: 480px)": 12 },
    borderRadius: 32,
    backgroundImage:
      "linear-gradient(135deg, color-mix(in srgb, var(--lenso-tint) 18%, var(--lenso-background-grouped-primary)), var(--lenso-background-grouped-secondary))",
  },
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
      default: "color-mix(in oklch, var(--lenso-control-border) 80%, transparent)",
      ":focus": "color-mix(in oklch, var(--lenso-tint) 40%, transparent)",
    },
    backgroundColor: {
      default: "var(--lenso-control-fill)",
      ":focus": "var(--lenso-control-tint-subtle-fill)",
    },
  },
  separator: { backgroundColor: "var(--lenso-control-border)" },
  resendLink: { fontSize: 14, color: "var(--lenso-link)" },
  form: { display: "flex", flexDirection: "column", gap: 16, width: 328, maxWidth: "100%" },
  full: { width: "100%" },
  submit: { marginTop: 8, width: "100%" },
  help: { display: "flex", alignItems: "center", justifyContent: "center", gap: 4 },
});

export function Slots({ custom = false }: { custom?: boolean }) {
  return (
    <>
      <InputOTP.Group>
        <InputOTP.Slot aria-label="Digit 1" xstyle={custom && styles.customSlot} index={0} />
        <InputOTP.Slot aria-label="Digit 2" xstyle={custom && styles.customSlot} index={1} />
        <InputOTP.Slot aria-label="Digit 3" xstyle={custom && styles.customSlot} index={2} />
      </InputOTP.Group>
      <InputOTP.Separator xstyle={custom && styles.separator} />
      <InputOTP.Group>
        <InputOTP.Slot aria-label="Digit 4" xstyle={custom && styles.customSlot} index={3} />
        <InputOTP.Slot aria-label="Digit 5" xstyle={custom && styles.customSlot} index={4} />
        <InputOTP.Slot aria-label="Digit 6" xstyle={custom && styles.customSlot} index={5} />
      </InputOTP.Group>
    </>
  );
}
