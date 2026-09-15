import * as stylex from "@stylexjs/stylex";

export const styles = stylex.create({
  root: {
    backgroundColor: "var(--color-surface-canvas)",
    boxSizing: "border-box",
    color: "var(--color-content-primary)",
    fontFamily: "var(--font-sans)",
    minHeight: "100%",
    minWidth: 0,
    overflow: "auto",
  },
  content: {
    display: "grid",
    gap: "32px",
    marginInline: "auto",
    paddingBlock: "48px 64px",
    width: "min(100% - 48px, 680px)",
    "@media (max-width: 560px)": {
      paddingBlock: "32px 48px",
      width: "min(100% - 32px, 680px)",
    },
  },
  pageHeader: {
    display: "grid",
    gap: "var(--space-2, 8px)",
  },
  pageTitle: {
    fontSize: "24px",
    fontWeight: 600,
    letterSpacing: "-0.02em",
    lineHeight: 1.25,
    margin: 0,
  },
  pageDescription: {
    color: "var(--color-content-tertiary)",
    fontSize: "13px",
    lineHeight: 1.5,
    margin: 0,
    maxWidth: "62ch",
  },
});
