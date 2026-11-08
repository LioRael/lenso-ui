import * as stylex from "@stylexjs/stylex";

export const toggleButtonStyles = stylex.create({
  selected: {
    ":is([data-pressed]):not(:disabled, [aria-disabled='true'])": {
      backgroundColor: "var(--lenso-control-tint, var(--lenso-tint))",
      color: "var(--lenso-control-on-tint, var(--lenso-label-on-tint))",
    },
    ":is([data-pressed]):is(:disabled, [aria-disabled='true'])": {
      backgroundColor: "var(--lenso-fill-secondary)",
      color: "var(--lenso-label-secondary)",
    },
    "@media (forced-colors: active)": {
      ":is([data-pressed])": { backgroundColor: "Highlight", color: "HighlightText" },
    },
  },
  prominentSelected: {
    ":is([data-pressed]):not(:disabled, [aria-disabled='true'])": {
      backgroundColor:
        "color-mix(in srgb, var(--lenso-control-tint, var(--lenso-tint)) 80%, black)",
    },
    "@media (forced-colors: active)": {
      ":is([data-pressed])": { backgroundColor: "Highlight" },
    },
  },
});
