// HeroUI v3.2.6 list-box-item.css adaptation, Apache-2.0.
import * as stylex from "@stylexjs/stylex";
import { focusRing } from "../../focus-ring.stylex.const.js";
import { tokens } from "../../tokens.stylex.const.js";
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
    paddingInlineEnd: { default: 8, ":has([data-collection-indicator])": 28 },
    borderRadius: tokens.radius2xl,
    color: tokens.foreground,
    fontSize: 14,
    cursor: tokens.cursorInteractive,
    outline: "none",
    boxShadow: { default: "none", ":focus-visible": focusRing.outer },
    backgroundColor: { default: "transparent", ":hover": tokens.default },
    transform: { default: "none", ":active": "scale(.98)" },
    transitionProperty: "transform, box-shadow",
    transitionDuration: {
      default: "250ms, 150ms",
      "@media (prefers-reduced-motion: reduce)": "0ms",
    },
    transitionTimingFunction: `cubic-bezier(.25, 1, .5, 1), ${tokens.easeOut}`,
    marginBlockStart: { default: 0, ":is([role='listbox'] > :not(:first-child))": 4 },
  },
  danger: { color: tokens.danger },
  disabled: {
    opacity: tokens.disabledOpacity,
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
    color: tokens.defaultForeground,
  },
  indicatorDanger: { color: tokens.danger },
});
