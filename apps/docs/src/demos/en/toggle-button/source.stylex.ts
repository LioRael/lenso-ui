import * as stylex from "@stylexjs/stylex";
export const styles = stylex.create({
  row: { display: "flex", alignItems: "center", gap: 12 },
  column: { display: "flex", flexDirection: "column", gap: 24 },
  controlled: { display: "flex", flexDirection: "column", gap: 16 },
  muted: { fontSize: 14, color: "var(--muted)" },
  medium: { fontWeight: 500 },
  custom: {
    gap: 8,
    borderRadius: 9999,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: {
      default: "color-mix(in oklab,var(--border) 80%,transparent)",
      ":is([data-pressed])": "color-mix(in oklab,var(--accent) 30%,transparent)",
    },
    backgroundColor: { default: "var(--surface)", ":is([data-pressed])": "var(--accent-soft)" },
    paddingInline: 16,
    color: { default: "var(--foreground)", ":is([data-pressed])": "var(--accent-soft-foreground)" },
    boxShadow: "var(--shadow-sm)",
  },
  icon: { color: { default: "var(--muted)", ":is([data-pressed] *)": "var(--accent)" } },
});
