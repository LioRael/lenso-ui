import * as stylex from "@stylexjs/stylex";

import { tokens } from "../tokens.stylex.js";

export const motion = stylex.defineVars({
  durationFast: tokens.motionFeedback,
  durationBase: tokens.motionState,
  durationOverlay: tokens.motionOverlay,
  durationDialog: tokens.motionOverlay,
  easeHover: "ease",
  easeOut: "cubic-bezier(0.23, 1, 0.32, 1)",
  easeInOut: "cubic-bezier(0.77, 0, 0.175, 1)",
});
