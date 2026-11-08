"use client";
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
  label: { fontWeight: 500, color: "var(--lenso-label-primary)" },
  customGroup: { borderRadius: 12, backgroundColor: "var(--lenso-control-fill)" },
  customInput: { textAlign: "center", fontVariantNumeric: "tabular-nums" },
  customButton: {
    color: { default: "var(--lenso-label-secondary)", ":hover": "var(--lenso-label-primary)" },
  },
  chevrons: {
    display: "flex",
    height: "100%",
    flexDirection: "column",
    borderInlineStart:
      "1px solid color-mix(in oklch, var(--lenso-label-placeholder) 15%, transparent)",
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
