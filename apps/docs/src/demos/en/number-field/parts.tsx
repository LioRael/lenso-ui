"use client";
// Adapted from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e), Apache-2.0.
import { NumberField } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";

export const styles = stylex.create({
  column: { display: "flex", flexDirection: "column", gap: 16, width: "100%", maxWidth: 256 },
  field: { width: "100%", maxWidth: 256 },
  input: { width: 120 },
  fullInput: { width: "100%" },
  full: { width: "100%" },
  wide: { width: 400, maxWidth: "100%" },
  form: { display: "flex", flexDirection: "column", gap: 16, width: 280, maxWidth: "100%" },
  surface: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
    width: "100%",
    maxWidth: 280,
    borderRadius: 24,
    padding: 24,
  },
  row: { display: "flex", gap: 8 },
  guests: { width: "100%", maxWidth: 192 },
  label: { fontWeight: 500, color: "var(--foreground)" },
  customGroup: { borderRadius: 12, backgroundColor: "var(--default)" },
  customInput: { textAlign: "center", fontVariantNumeric: "tabular-nums" },
  customButton: { color: { default: "var(--muted)", ":hover": "var(--foreground)" } },
  chevrons: {
    display: "flex",
    height: "100%",
    flexDirection: "column",
    borderInlineStart: "1px solid color-mix(in oklch, var(--field-placeholder) 15%, transparent)",
  },
  chevronButton: {
    display: "flex",
    height: "50%",
    width: 24,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 0,
    borderWidth: 0,
    fontSize: 14,
  },
  up: { paddingTop: 2 },
  down: { paddingBottom: 2 },
  flexInput: { flexGrow: 1 },
});

export function Controls({ fullWidth = false }: { fullWidth?: boolean }) {
  return (
    <NumberField.Group>
      <NumberField.DecrementButton />
      <NumberField.Input xstyle={fullWidth ? styles.fullInput : styles.input} />
      <NumberField.IncrementButton />
    </NumberField.Group>
  );
}
