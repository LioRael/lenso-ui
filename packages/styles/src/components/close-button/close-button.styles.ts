import * as stylex from "@stylexjs/stylex";
import { focusRing } from "../../focus-ring.stylex.const.js";
import { tokens } from "../../tokens.stylex.const.js";
export const closeButtonStyles = stylex.create({
  root: {
    position: "relative",
    isolation: "isolate",
    display: "inline-flex",
    flexShrink: 0,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 0,
    borderRadius: tokens.radiusXl,
    paddingInline: 4,
    paddingBlock: 4,
    userSelect: "none",
    cursor: {
      default: tokens.cursorInteractive,
      ":disabled": tokens.cursorDisabled,
      ':is([aria-disabled="true"])': tokens.cursorDisabled,
    },
    backgroundColor: {
      default: tokens.default,
      "@media (hover: hover)": { default: null, ":hover": tokens.defaultHover },
    },
    color: tokens.muted,
    WebkitTapHighlightColor: "transparent",
    transform: { default: "none", ":active": "scale(0.93)" },
    transitionProperty: "transform, color, background-color, box-shadow",
    transitionDuration: {
      default: "250ms, 150ms, 100ms, 150ms",
      "@media (prefers-reduced-motion: reduce)": "0ms",
    },
    transitionTimingFunction: "cubic-bezier(0.165, 0.84, 0.44, 1), ease-out, ease-out, ease-out",
    outlineStyle: "none",
    boxShadow: {
      default: "none",
      ":focus-visible": focusRing.outer,
    },
    opacity: {
      default: 1,
      ":disabled": tokens.disabledOpacity,
      ':is([aria-disabled="true"])': tokens.disabledOpacity,
    },
  },
  icon: {
    width: 16,
    height: 16,
    pointerEvents: "none",
    flexShrink: 0,
    alignSelf: "center",
    marginInline: -2,
    marginBlock: 2,
  },
});
