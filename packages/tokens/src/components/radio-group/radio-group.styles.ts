// Modified: StyleX styles and UI SDK orientation selectors.
import * as stylex from "@stylexjs/stylex";

export const radioGroupStyles = stylex.create({
  root: {
    display: "flex",
    flexDirection: {
      default: "column",
      ":is([data-orientation='horizontal'], [aria-orientation='horizontal'])": "row",
    },
    flexWrap: "wrap",
    gap: {
      default: 0,
      ":is([data-orientation='horizontal'], [aria-orientation='horizontal'])": "1rem",
    },
  },
});
