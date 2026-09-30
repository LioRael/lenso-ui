import * as stylex from "@stylexjs/stylex";
export const styles = stylex.create({
  root: {
    gap: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "color-mix(in oklab,var(--border) 80%,transparent)",
    backgroundColor: "var(--surface-secondary)",
    padding: 6,
  },
  group: { gap: 2 },
  toggle: {
    borderRadius: 8,
    backgroundColor: { default: null, ":is([data-pressed])": "var(--accent)" },
    color: { default: null, ":is([data-pressed])": "var(--accent-foreground)" },
  },
});
