import * as stylex from "@stylexjs/stylex";

export const styles = stylex.create({
  surface: {
    overflow: "hidden",
    padding: 0,
    width: "100%",
    "@media (forced-colors: active)": {
      borderColor: "CanvasText",
      borderStyle: "solid",
      borderWidth: "1px",
    },
  },
  root: {
    boxSizing: "border-box",
    display: "grid",
    gap: "var(--space-2, 8px)",
    minWidth: 0,
    padding: "var(--space-3, 12px)",
    width: "100%",
  },
  input: {
    backgroundColor: "transparent",
    borderWidth: 0,
    boxSizing: "border-box",
    color: "var(--color-content-primary)",
    fontFamily: "var(--font-sans)",
    fontSize: "14px",
    lineHeight: 1.5,
    margin: 0,
    maxWidth: "100%",
    minWidth: 0,
    outline: "none",
    outlineColor: {
      "@media (forced-colors: active)": "Highlight",
    },
    outlineOffset: 0,
    overflowWrap: "anywhere",
    padding: 0,
    resize: "none",
    width: "100%",
    "::placeholder": {
      color: "var(--color-content-tertiary)",
      opacity: 1,
    },
    ":focus-visible": {
      outline: "2px solid var(--color-focus-ring)",
      outlineOffset: "3px",
    },
  },
  toolbar: {
    alignItems: "center",
    display: "flex",
    gap: "var(--space-2, 8px)",
    justifyContent: "space-between",
    minWidth: 0,
  },
  actions: {
    alignItems: "center",
    display: "flex",
    gap: "var(--space-1, 4px)",
  },
});
