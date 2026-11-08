/**
 * Copyright NextUI Inc. SPDX-License-Identifier: Apache-2.0.
 * Modified: source utility declarations expressed as StyleX.
 */
import * as stylex from "@stylexjs/stylex";

export const styles = stylex.create({
  field: { width: 256, maxWidth: "100%" },
  column: { display: "flex", flexDirection: "column", gap: 16 },
  row: { display: "flex", gap: 8 },
  granularity: { display: "flex", gap: 16, flexWrap: "wrap" },
  selector: { display: "flex", flexDirection: "column", gap: 4 },
  selectorLabel: { display: "flex", alignItems: "center", gap: 8 },
  select: { width: 110 },
  full: { width: "100%" },
  wide: { width: 400, maxWidth: "100%", display: "flex", flexDirection: "column", gap: 16 },
  form: { display: "flex", width: 280, maxWidth: "100%", flexDirection: "column", gap: 16 },
  surface: {
    display: "flex",
    width: "100%",
    maxWidth: 384,
    flexDirection: "column",
    gap: 16,
    borderRadius: 24,
    padding: 24,
  },
  icon: { width: 16, height: 16, color: "var(--lenso-label-secondary)" },
  dateCustom: {
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "color-mix(in oklab, var(--lenso-control-border) 80%, transparent)",
    backgroundColor: "var(--lenso-control-fill)",
    boxShadow: "var(--lenso-surface-shadow)",
  },
  reminder: { width: "100%", maxWidth: 192, gap: 6 },
  reminderLabel: { fontWeight: 500, color: "var(--lenso-label-primary)" },
  reminderGroup: {
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: {
      default: "color-mix(in oklab, var(--lenso-control-border) 80%, transparent)",
      ":focus-within": "color-mix(in oklab, var(--lenso-tint) 25%, transparent)",
    },
    backgroundColor: "var(--lenso-background-grouped-secondary)",
    paddingInline: 8,
    paddingBlock: 4,
    boxShadow: {
      default: "0 0 0 1px var(--lenso-control-border)",
      ":focus-within": "0 0 0 2px var(--lenso-focus-ring), var(--lenso-field-shadow)",
    },
  },
  foreground: { color: "var(--lenso-label-primary)" },
});
