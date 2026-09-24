import * as stylex from "@stylexjs/stylex";

export const styles = stylex.create({
  root: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    height: "auto",
    marginTop: "24px",
    minHeight: 0,
    minWidth: 0,
    width: "100%",
  },
  heading: { minWidth: 0, width: "100%" },
  title: {
    color: "var(--color-content-primary)",
    fontSize: "16px",
    fontWeight: 600,
    lineHeight: "24px",
    margin: 0,
    scrollMarginTop: "72px",
  },
  description: {
    color: "var(--color-content-secondary)",
    fontSize: "14px",
    lineHeight: "22px",
    margin: "4px 0 0",
  },
});
