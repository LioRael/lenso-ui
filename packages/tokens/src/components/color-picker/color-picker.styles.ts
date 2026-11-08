// Copyright NextUI Inc. Apache-2.0. Modified for StyleX.
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
export const colorPickerStyles = stylex.create({
  root: { display: "inline-flex" },
  trigger: {
    display: "inline-flex",
    alignItems: "center",
    gap: 12,
    borderRadius: tokens.shapeContentSm,
    borderWidth: 0,
    backgroundColor: "transparent",
    color: tokens.labelPrimary,
    fontSize: 14,
    cursor: "pointer",
    padding: 0,
  },
  focused: { outline: "none", boxShadow: focusRing.outer },
  disabled: { opacity: 0.5 },
  popover: {
    width: 386,
    maxWidth: "calc(100vw - 24px)",
    maxHeight: "var(--available-height)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    backgroundColor: "transparent",
    color: tokens.labelPrimary,
    // Picker 10460:4246 overrides the Medium material's lower corners.
    borderRadius: "32px 32px 58px 58px",
    outline: "none",
  },
  content: {
    display: "flex",
    flexDirection: "column",
    minHeight: 0,
    boxSizing: "border-box",
    gap: 12,
    paddingInline: 16,
    paddingTop: 8,
    paddingBottom: 12,
    overflowX: "hidden",
    overflowY: "auto",
    overscrollBehavior: "contain",
    scrollbarWidth: "none",
  },
  dialog: { outline: "none" },
  entering: {
    animationName: enter,
    animationDuration: { default: "150ms", "@media (prefers-reduced-motion: reduce)": "0ms" },
    animationTimingFunction: tokens.motionEaseSmooth,
    transformOrigin: "var(--trigger-anchor-point)",
    willChange: "opacity,transform",
  },
  exiting: {
    animationName: exit,
    animationDuration: { default: "100ms", "@media (prefers-reduced-motion: reduce)": "0ms" },
    animationTimingFunction: tokens.motionEaseSmooth,
    pointerEvents: "none",
    transformOrigin: "var(--trigger-anchor-point)",
    willChange: "opacity,transform",
  },
});
