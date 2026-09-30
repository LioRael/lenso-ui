/** HeroUI v3.2.6 derived work. Copyright NextUI Inc. Apache-2.0. Modified for StyleX. */
import * as stylex from "@stylexjs/stylex";
import { tokens } from "../../tokens.stylex.const.js";
export const colorSwatchStyles = stylex.create({
  root: {
    position: "relative",
    boxSizing: "border-box",
    width: 32,
    height: 32,
    flexShrink: 0,
    borderRadius: tokens.radius2xl,
    boxShadow: "inset 0 0 0 1px rgba(0,0,0,.1)",
  },
  square: { borderRadius: tokens.radiusMd },
  xs: { width: 16, height: 16, borderRadius: tokens.radiusLg },
  sm: { width: 24, height: 24, borderRadius: tokens.radiusXl },
  md: { width: 32, height: 32 },
  lg: { width: 36, height: 36, borderRadius: tokens.radius3xl },
  xl: { width: 40, height: 40, borderRadius: tokens.radius3xl },
});
