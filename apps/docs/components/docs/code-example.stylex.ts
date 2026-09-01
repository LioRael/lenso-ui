import * as stylex from "@stylexjs/stylex";

export const styles = stylex.create({
  root: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    height: "auto",
    marginTop: "24px",
    minHeight: 0,
    width: "1080px",
    "@media (max-width: 1320px)": { width: "100%" },
  },
  heading: { width: "1080px", "@media (max-width: 1320px)": { width: "100%" } },
  title: {
    color: "var(--color-content-primary)",
    fontSize: "14px",
    fontWeight: 500,
    lineHeight: "20px",
    margin: 0,
    scrollMarginTop: "72px",
  },
  description: {
    color: "var(--color-content-secondary)",
    fontSize: "13px",
    lineHeight: "20px",
    margin: "2px 0 0",
  },
});
