import * as stylex from "@stylexjs/stylex";

export const styles = stylex.create({
  root: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    height: "auto",
    marginTop: "24px",
    minHeight: "152px",
    width: "1080px",
    "@media (max-width: 1320px)": { width: "100%" },
  },
  block: {
    height: "auto",
    minHeight: "68px",
    width: "1080px",
    "@media (max-width: 1320px)": { width: "100%" },
  },
  title: {
    color: "var(--color-content-primary)",
    fontSize: "14px",
    fontWeight: 500,
    lineHeight: "20px",
    margin: 0,
    scrollMarginTop: "72px",
  },
  content: { color: "var(--color-content-secondary)", fontSize: "13px", lineHeight: "20px" },
});
