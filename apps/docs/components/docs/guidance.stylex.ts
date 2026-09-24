import * as stylex from "@stylexjs/stylex";

export const styles = stylex.create({
  root: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    height: "auto",
    marginTop: "24px",
    minWidth: 0,
    width: "100%",
  },
  block: {
    height: "auto",
    minWidth: 0,
    width: "100%",
  },
  title: {
    color: "var(--color-content-primary)",
    fontSize: "16px",
    fontWeight: 600,
    lineHeight: "24px",
    margin: 0,
    scrollMarginTop: "72px",
  },
  content: { color: "var(--color-content-secondary)", fontSize: "14px", lineHeight: "22px" },
});
