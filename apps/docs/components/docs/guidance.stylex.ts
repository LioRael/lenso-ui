import * as stylex from "@stylexjs/stylex";

export const styles = stylex.create({
  root: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    height: "auto",
    marginTop: "24px",
    width: "1080px",
    "@media (max-width: 1320px)": { width: "100%" },
  },
  block: {
    height: "auto",
    width: "1080px",
    "@media (max-width: 1320px)": { width: "100%" },
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
