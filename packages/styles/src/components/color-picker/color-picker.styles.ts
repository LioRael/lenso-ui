/** HeroUI v3.2.6 derived work. Copyright NextUI Inc. Apache-2.0. Modified for StyleX. */
import * as stylex from "@stylexjs/stylex";
import { tokens } from "../../tokens.stylex.const.js";
const enter = stylex.keyframes({
  from: { opacity: 0, transform: "var(--picker-enter-from,scale(.95))" },
  to: { opacity: 1, transform: "scale(1)" },
});
const exit = stylex.keyframes({
  from: { opacity: 1, transform: "scale(1)" },
  to: { opacity: 0, transform: "scale(.95)" },
});
export const colorPickerStyles = stylex.create({
  root: { display: "inline-flex" },
  trigger: {
    display: "inline-flex",
    alignItems: "center",
    gap: 12,
    borderRadius: tokens.radiusSm,
    borderWidth: 0,
    backgroundColor: "transparent",
    color: tokens.foreground,
    fontSize: 14,
    cursor: "pointer",
    padding: 0,
  },
  focused: { outline: "2px solid", outlineColor: tokens.focus, outlineOffset: 2 },
  disabled: { opacity: tokens.disabledOpacity },
  popover: {
    minWidth: 248,
    display: "flex",
    flexDirection: "column",
    gap: 12,
    paddingInline: 8,
    paddingTop: 8,
    paddingBottom: 12,
    overflowX: "hidden",
    overflowY: "auto",
    overscrollBehavior: "contain",
    backgroundColor: tokens.overlay,
    color: tokens.overlayForeground,
    borderRadius: tokens.radius3xl,
    boxShadow: tokens.shadowOverlay,
    outline: "none",
    scrollbarWidth: "none",
  },
  dialog: { outline: "none" },
  entering: {
    animationName: enter,
    animationDuration: { default: "150ms", "@media (prefers-reduced-motion: reduce)": "0ms" },
    animationTimingFunction: tokens.easeSmooth,
    transformOrigin: "var(--trigger-anchor-point)",
    willChange: "opacity,transform",
  },
  exiting: {
    animationName: exit,
    animationDuration: { default: "100ms", "@media (prefers-reduced-motion: reduce)": "0ms" },
    animationTimingFunction: tokens.easeSmooth,
    pointerEvents: "none",
    transformOrigin: "var(--trigger-anchor-point)",
    willChange: "opacity,transform",
  },
});
