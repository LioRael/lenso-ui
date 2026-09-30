/** HeroUI v3.2.6 derived work. Copyright NextUI Inc. Apache-2.0. Modified for StyleX. */
import * as stylex from "@stylexjs/stylex";
import { tokens } from "../../tokens.stylex.const.js";
export const colorAreaStyles = stylex.create({
  root: {
    position: "relative",
    width: "100%",
    maxWidth: 224,
    flexShrink: 0,
    borderRadius: tokens.radius2xl,
    aspectRatio: "1 / 1",
    boxShadow: "inset 0 0 0 1px rgba(0,0,0,.1)",
    touchAction: "none",
  },
  dots: {
    "::after": {
      content: '""',
      pointerEvents: "none",
      position: "absolute",
      inset: 0,
      borderRadius: "inherit",
      backgroundImage: "radial-gradient(circle,rgba(255,255,255,.2) 1px,transparent 1px)",
      backgroundSize: "8px 8px",
    },
  },
  thumb: {
    width: 16,
    height: 16,
    borderRadius: tokens.radiusXl,
    borderWidth: 3,
    borderStyle: "solid",
    borderColor: "white",
    boxSizing: "border-box",
    boxShadow: "0 0 0 1px rgba(0,0,0,.1),inset 0 0 0 1px rgba(0,0,0,.1)",
    transitionProperty: "width,height",
    transitionDuration: { default: "150ms", "@media (prefers-reduced-motion: reduce)": "0ms" },
    transitionTimingFunction: tokens.easeSmooth,
  },
  dragging: { width: 20, height: 20 },
  focused: { outline: "2px solid", outlineColor: tokens.focus, outlineOffset: 2 },
  disabled: { opacity: tokens.disabledOpacity },
});
