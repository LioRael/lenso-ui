import * as stylex from "@stylexjs/stylex";
import { focusRing } from "../../focus-ring.stylex.const.js";
import { tokens } from "../../tokens.stylex.const.js";
export const tagStyles = stylex.create({
  cell: { display: "inline-flex", alignItems: "center", gap: "inherit" },
  root: {
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    borderRadius: tokens.shapeContentXl,
    fontWeight: 500,
    userSelect: "none",
    paddingInline: 8,
    paddingBlock: 4,
    fontSize: 12,
    cursor: tokens.cursorInteractive,
    outline: "none",
    boxShadow: { default: "none", ":focus-visible": focusRing.outer },
    transitionProperty: "color, scale, opacity, background-color, box-shadow",
    transitionDuration: { default: "100ms", "@media (prefers-reduced-motion: reduce)": "0ms" },
    transitionTimingFunction: tokens.motionEaseSmooth,
  },
  sm: { paddingBlock: 2 },
  md: { paddingBlock: 4 },
  lg: { paddingInline: 10, paddingBlock: 6, fontSize: 14, borderRadius: tokens.shapeContent2xl },
  default: {
    color: tokens.labelPrimary,
    backgroundColor: { default: "transparent", ":hover": tokens.controlHoverFill },
  },
  surface: {
    color: tokens.labelPrimary,
    backgroundColor: {
      default: "transparent",
      ":hover": tokens.controlHoverFill,
    },
  },
  selected: {
    color: tokens.tintText,
    backgroundColor: {
      default: tokens.controlTintSubtleFill,
      ":hover": tokens.controlTintHoverFill,
    },
  },
  disabled: {
    opacity: 0.5,
    cursor: tokens.cursorDisabled,
    pointerEvents: "none",
  },
  removeButton: {
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 12,
    height: 12,
    padding: 0,
    borderWidth: 0,
    backgroundColor: "transparent",
    color: "inherit",
    cursor: tokens.cursorInteractive,
    "::after": { content: '""', position: "absolute", inset: -6 },
  },
});
