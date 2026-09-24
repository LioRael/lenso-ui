import * as stylex from "@stylexjs/stylex";

export const styles = stylex.create({
  center: { textAlign: "center" },
  cellCopy: {
    alignItems: "center",
    display: "flex",
    gap: "var(--space-2)",
    minWidth: 0,
  },
  text: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  swatch: {
    borderRadius: "4px",
    flexShrink: 0,
    height: "16px",
    width: "16px",
  },
  flag: { flexShrink: 0, fontSize: "16px", lineHeight: "20px" },
  link: {
    color: "var(--color-content-tertiary)",
    overflow: "hidden",
    textDecoration: "none",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    ":hover": { color: "var(--color-content-primary)", textDecoration: "underline" },
  },
  summaryButton: {
    alignItems: "center",
    backgroundColor: "transparent",
    borderWidth: 0,
    color: "var(--color-content-tertiary)",
    cursor: "pointer",
    display: "flex",
    font: "inherit",
    height: "100%",
    justifyContent: "space-between",
    padding: 0,
    textAlign: "left",
    width: "100%",
    ":hover": { color: "var(--color-content-primary)" },
    ":focus-visible": {
      outlineColor: "var(--color-focus-ring)",
      outlineStyle: "solid",
      outlineWidth: "2px",
    },
  },
  table: { width: "100%" },
});
