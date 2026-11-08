export { knobMaterialStyles } from "./knob.styles.js";
export { liquidMaterialStyles, materialStyles } from "./material.styles.js";
export { vibrantStyles } from "./material.styles.js";

export type MaterialVariant =
  | "ultrathin"
  | "thin"
  | "regular"
  | "thick"
  | "chrome"
  | "glass-small"
  | "glass-medium"
  | "glass-large"
  | "glass-clear";

/** Figma Fill + Shadow: dark neutral glass and theme-independent Clear contours. */
export const materialContours = {
  dark: { gray: 166 / 255, sideGray: 166 / 255, spread: 0.5, sideOffset: 1.25, sideSpread: -0.75 },
  clear: { gray: 204 / 255, sideGray: 208 / 255, spread: 0.5, sideOffset: 1.25, sideSpread: -0.75 },
} as const;
