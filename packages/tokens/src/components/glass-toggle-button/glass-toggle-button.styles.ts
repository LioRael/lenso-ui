import * as stylex from "@stylexjs/stylex";

export const glassToggleButtonStyles = stylex.create({
  selectedMaterial: {
    ":is([data-pressed]):not(:disabled, [aria-disabled='true'])": {
      "--lenso-glass-material-fill": "var(--lenso-control-tint, var(--lenso-tint))",
      "--lenso-glass-material-blend": "multiply",
    },
  },
});
