import * as stylex from "@stylexjs/stylex";
export const styles = stylex.create({
  row: { display: "flex", alignItems: "center", gap: 12 },
  column: { display: "flex", flexDirection: "column", gap: 24 },
  controlled: { display: "flex", flexDirection: "column", gap: 16 },
  muted: { fontSize: 14, color: "var(--lenso-label-secondary)" },
  medium: { fontWeight: 500 },
  custom: {
    gap: 8,
    borderRadius: 9999,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: {
      default: "color-mix(in oklab,var(--lenso-control-border) 80%,transparent)",
      ":is([data-pressed])": "color-mix(in oklab,var(--lenso-tint) 30%,transparent)",
    },
    backgroundColor: {
      default: "var(--lenso-background-grouped-secondary)",
      ":is([data-pressed])": "var(--lenso-control-tint-subtle-fill)",
    },
    paddingInline: 16,
    color: {
      default: "var(--lenso-label-primary)",
      ":is([data-pressed])": "var(--lenso-tint-text)",
    },
    boxShadow: "var(--lenso-surface-shadow)",
  },
  icon: {
    color: {
      default: "var(--lenso-label-secondary)",
      ":is([data-pressed] *)": "var(--lenso-tint)",
    },
  },
});
