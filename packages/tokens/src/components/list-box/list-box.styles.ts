import { tokens } from "../../tokens.stylex.const.js";
import { focusRing } from "../../focus-ring.stylex.const.js";
import * as stylex from "@stylexjs/stylex";
export const listBoxStyles = stylex.create({
  root: { position: "relative", width: "100%", overflow: "clip", padding: 4 },
});

export const listBoxItemStyles = stylex.create({
  checkmark: {
    width: 10,
    height: 10,
    transitionProperty: "stroke-dashoffset",
    transitionDuration: {
      default: "300ms",
      ":is([aria-selected='true'] *)": "250ms",
      "@media (prefers-reduced-motion: reduce)": "0ms",
    },
    transitionTimingFunction: {
      default: "cubic-bezier(.4, 0, .2, 1)",
      ":is([aria-selected='true'] *)": "linear",
    },
  },
  root: {
    position: "relative",
    boxSizing: "border-box",
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 12,
    minHeight: 36,
    width: "100%",
    paddingBlock: 6,
    paddingInlineStart: 8,
    paddingInlineEnd: 28,
    borderRadius: tokens.shapeContent2xl,
    color: tokens.labelPrimary,
    fontSize: 14,
    cursor: tokens.cursorInteractive,
    outline: "none",
    boxShadow: { default: "none", ":focus-visible": focusRing.outer },
    backgroundColor: { default: "transparent", ":hover": tokens.controlFill },
    transform: { default: "none", ":active": "scale(.98)" },
    transitionProperty: "transform, box-shadow",
    transitionDuration: {
      default: "250ms, 150ms",
      "@media (prefers-reduced-motion: reduce)": "0ms",
    },
    transitionTimingFunction: `cubic-bezier(.25, 1, .5, 1), ${tokens.motionEaseOut}`,
    marginBlockStart: { default: 0, ":is([role='listbox'] > :not(:first-child))": 4 },
  },
  danger: { color: tokens.statusErrorText },
  disabled: {
    opacity: 0.5,
    cursor: tokens.cursorDisabled,
    pointerEvents: "none",
  },
  indicator: {
    position: "absolute",
    insetInlineEnd: 8,
    top: "50%",
    transform: "translateY(-50%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 16,
    height: 16,
    color: tokens.labelPrimary,
  },
  indicatorDanger: { color: tokens.statusErrorText },
});

export const listBoxSectionStyles = stylex.create({
  root: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 0,
    marginBlockStart: { default: 0, ":is([role='listbox'] > :not(:first-child))": 4 },
  },
});

export const listBoxSectionLabelStyles = stylex.create({
  root: {
    width: "100%",
    paddingInline: 8,
    paddingTop: 6,
    paddingBottom: 4,
    textAlign: "start",
    fontSize: 12,
    lineHeight: "16px",
    fontWeight: 500,
    color: tokens.labelSecondary,
  },
});
