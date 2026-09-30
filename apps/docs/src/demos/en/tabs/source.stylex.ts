import * as stylex from "@stylexjs/stylex";
export const styles = stylex.create({
  root: { width: "100%", maxWidth: 448 },
  vertical: { width: "100%", maxWidth: 512 },
  overflow: { width: 400 },
  panel: { paddingTop: 16 },
  verticalPanel: { paddingInline: 16 },
  heading: { marginBottom: 8, fontWeight: 600 },
  muted: { fontSize: 14, color: "var(--muted)" },
  customRoot: { width: "100%", maxWidth: 384 },
  customContainer: { borderRadius: 0, backgroundColor: "transparent" },
  customList: {
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "color-mix(in oklab,var(--accent) 10%,transparent)",
    backgroundColor: "color-mix(in oklab,var(--accent-soft) 30%,transparent)",
    padding: 4,
  },
  customTab: {
    borderRadius: 8,
    backgroundColor: {
      default: "transparent",
      ":hover:not([data-active])": "var(--accent-soft)",
      ":active:not([data-active])": "var(--accent-soft-hover)",
    },
    color: {
      default: "var(--muted)",
      ":hover:not([data-active])": "var(--accent-soft-foreground)",
      ":is([data-active])": "var(--accent-foreground)",
    },
    opacity: 1,
    transitionProperty: "color,background-color",
    transitionDuration: "150ms",
    fontWeight: { default: null, ":is([data-active])": 500 },
    boxShadow: {
      default: "none",
      ":focus-visible": "0 0 0 2px color-mix(in oklab,var(--accent) 15%,transparent)",
    },
  },
  customIndicator: { borderRadius: 8, backgroundColor: "var(--accent)", boxShadow: "none" },
  customPanel: { paddingTop: 12, fontSize: 14, color: "var(--muted)" },
});
