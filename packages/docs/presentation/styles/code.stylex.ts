import * as stylex from "@stylexjs/stylex";

export const codeStyles = stylex.create({
  containment: (contain: string) => ({ contain }),
  token: (light: string, dark: string) => ({
    color: { default: light, ":is(.dark *)": dark },
  }),
  fileList: {
    display: "flex",
    gap: 4,
    padding: 8,
    paddingInlineEnd: 48,
    overflowX: "auto",
    borderBottomWidth: 1,
    borderBottomStyle: "solid",
    borderBottomColor: "var(--lenso-separator)",
  },
  file: {
    backgroundColor: "transparent",
    color: "var(--docs-label-secondary, var(--lenso-label-secondary))",
    borderWidth: 0,
    borderRadius: 8,
    padding: 8,
    font: "inherit",
    fontSize: 12,
    cursor: "pointer",
    whiteSpace: "nowrap",
    ":focus-visible": { outline: "2px solid var(--lenso-focus-ring)" },
    ":is([aria-pressed=true])": {
      color: "var(--lenso-label-primary)",
      backgroundColor: "var(--lenso-control-fill)",
    },
  },
  innerScene: (minHeight: string) => ({
    display: "flex",
    width: "100%",
    minWidth: 0,
    alignItems: "center",
    justifyContent: "center",
    minHeight,
  }),
  start: { alignItems: "flex-start", justifyContent: "flex-start" },
  end: { alignItems: "flex-end", justifyContent: "flex-end" },
  solid: { backgroundColor: "var(--lenso-background-primary)" },
});
