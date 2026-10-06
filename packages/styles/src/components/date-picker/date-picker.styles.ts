/** HeroUI v3.2.6 derived work. Copyright NextUI Inc. Apache-2.0. Modified for StyleX. */
import * as stylex from "@stylexjs/stylex";
import { focusRing } from "../../focus-ring.stylex.const.js";
import { tokens } from "../../tokens.stylex.const.js";
const enter = stylex.keyframes({
  from: { opacity: 0, transform: "var(--picker-enter-from,scale(.95))" },
  to: { opacity: 1, transform: "scale(1)" },
});
const exit = stylex.keyframes({
  from: { opacity: 1, transform: "scale(1)" },
  to: { opacity: 0, transform: "scale(.95)" },
});
export const datePickerStyles = stylex.create({
  root: { display: "inline-flex", flexDirection: "column", gap: 4 },
  trigger: {
    display: "inline-flex",
    width: "100%",
    alignItems: "center",
    borderRadius: tokens.fieldRadius,
    padding: 4,
    fontSize: 14,
    cursor: "pointer",
    pointerEvents: "auto",
    borderWidth: 0,
    backgroundColor: "transparent",
    color: tokens.fieldForeground,
  },
  focused: { outline: "none", boxShadow: focusRing.outer },
  disabled: { opacity: tokens.disabledOpacity },
  indicator: {
    display: "inline-flex",
    width: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
    color: tokens.fieldPlaceholder,
  },
  popover: {
    width: "fit-content",
    overflowY: "auto",
    overscrollBehavior: "contain",
    backgroundColor: tokens.overlay,
    color: tokens.overlayForeground,
    padding: 12,
    boxShadow: tokens.shadowOverlay,
    borderRadius: tokens.radius3xl,
    outline: "none",
    scrollbarWidth: "none",
  },
  dialog: { outline: "none" },
  accessory: { pointerEvents: "auto" },
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
