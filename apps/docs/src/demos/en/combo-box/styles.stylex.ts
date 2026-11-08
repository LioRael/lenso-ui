// Source example utilities translated to StyleX.
import * as stylex from "@stylexjs/stylex";

export const styles = stylex.create({
  field: { display: "flex", flexDirection: "column", gap: 4, width: 256, maxWidth: "100%" },
  fullWidth: { width: "100%" },
  column: { display: "flex", flexDirection: "column", gap: 8 },
  menu: { display: "flex", flexDirection: "column", gap: 32 },
  wide: { width: 400, maxWidth: "100%", display: "flex", flexDirection: "column", gap: 16 },
  form: { display: "flex", flexDirection: "column", gap: 16, width: 256, maxWidth: "100%" },
  surface: { width: 320, maxWidth: "100%", borderRadius: 24, padding: 24 },
  muted: { margin: 0, fontSize: 14, color: "var(--lenso-label-secondary)" },
  caption: { margin: 0, fontSize: 14, fontWeight: 500, color: "var(--lenso-label-secondary)" },
  icon: { width: 12, height: 12 },
  user: { display: "flex", flexDirection: "column" },
  loading: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    paddingBlock: 8,
  },
  customField: { display: "flex", flexDirection: "column", gap: 6, width: 256, maxWidth: "100%" },
  customLabel: {
    fontWeight: 500,
    color: "var(--lenso-label-primary)",
  },
  customGroup: {
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "color-mix(in oklch, var(--lenso-control-border) 80%, transparent)",
    backgroundColor: "var(--lenso-background-grouped-secondary)",
    boxShadow: {
      default: "var(--lenso-surface-shadow)",
      ":focus-within": "0 0 0 2px var(--lenso-focus-ring), var(--lenso-field-shadow)",
      ":is([data-theme='dark'] *, .dark *)": "var(--lenso-surface-shadow)",
      ":is([data-theme='dark'] *, .dark *):focus-within":
        "0 0 0 2px var(--lenso-focus-ring), var(--lenso-field-shadow)",
    },
    transitionProperty: "box-shadow, border-color",
    transitionDuration: "150ms",
    transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
  },
  customPopover: {
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "color-mix(in oklch, var(--lenso-control-border) 80%, transparent)",
    backgroundColor: "var(--lenso-background-grouped-secondary)",
    padding: 4,
    boxShadow: "var(--lenso-overlay-shadow)",
  },
  customItem: {
    borderRadius: 8,
    backgroundColor: {
      default: null,
      ":is([data-highlighted])":
        "color-mix(in oklch, var(--lenso-label-secondary) 70%, transparent)",
    },
    fontWeight: { default: null, ":is([data-selected])": 500 },
    color: { default: null, ":is([data-selected])": "var(--lenso-label-primary)" },
  },
});
