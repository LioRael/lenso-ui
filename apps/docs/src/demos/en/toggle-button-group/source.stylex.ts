import * as stylex from "@stylexjs/stylex";
export const styles = stylex.create({
  column: { display: "flex", flexDirection: "column", gap: 24 },
  section: { display: "flex", flexDirection: "column", gap: 8 },
  controlled: { display: "flex", flexDirection: "column", gap: 16 },
  row: { display: "flex", alignItems: "flex-start", gap: 32 },
  full: { width: "100%", maxWidth: 448, display: "flex", flexDirection: "column", gap: 12 },
  muted: { fontSize: 14, color: "var(--lenso-label-secondary)" },
  medium: { fontWeight: 500 },
  custom: {
    gap: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "color-mix(in oklab,var(--lenso-control-border) 80%,transparent)",
    backgroundColor: "var(--lenso-background-grouped-secondary)",
    padding: 4,
    boxShadow: "var(--lenso-surface-shadow)",
  },
  toggle: {
    borderRadius: 8,
    color: {
      default: "var(--lenso-label-secondary)",
      ":is([data-pressed])": "var(--lenso-tint-text)",
    },
    backgroundColor: {
      default: null,
      ":is([data-pressed])": "var(--lenso-control-tint-subtle-fill)",
    },
  },
});
