import * as stylex from "@stylexjs/stylex";

export const surfaceDemoStyles = stylex.create({
  panel: {
    display: "flex",
    flexDirection: "column",
    boxSizing: "border-box",
    minWidth: 0,
    width: "100%",
    gap: 12,
    padding: 24,
  },
});
