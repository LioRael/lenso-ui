import * as stylex from "@stylexjs/stylex";
import { focusRing } from "../../focus-ring.stylex.const.js";
import { tokens } from "../../tokens.stylex.const.js";
export const disclosureStyles = stylex.create({
  root: { position: "relative" },
  heading: { display: "flex", margin: 0 },
  trigger: {
    display: "inline-block",
    cursor: {
      default: tokens.cursorInteractive,
      ":disabled": tokens.cursorDisabled,
      ':is([aria-disabled="true"])': tokens.cursorDisabled,
    },
    pointerEvents: { default: "auto", ":disabled": "none", ':is([aria-disabled="true"])': "none" },
    WebkitTapHighlightColor: "transparent",
    fontFamily: tokens.fontBody,
    color: "inherit",
    backgroundColor: "transparent",
    borderWidth: 0,
    outlineStyle: "none",
    boxShadow: {
      default: "none",
      ":focus-visible": focusRing.outer,
    },
    opacity: {
      default: 1,
      ":disabled": 0.5,
      ':is([aria-disabled="true"])': 0.5,
    },
  },
  indicator: {
    marginInlineStart: "auto",
    width: 16,
    height: 16,
    flexShrink: 0,
    color: "inherit",
    transform: { default: "rotate(0deg)", ":is([data-panel-open] *)": "rotate(-180deg)" },
    transitionProperty: "transform",
    transitionDuration: { default: "250ms", "@media (prefers-reduced-motion: reduce)": "0ms" },
    transitionTimingFunction: tokens.motionEaseSmooth,
  },
  content: {
    height: {
      default: "var(--collapsible-panel-height)",
      ":is([data-starting-style])": 0,
      ":is([data-ending-style])": 0,
    },
    opacity: { default: 1, ":is([data-starting-style])": 0, ":is([data-ending-style])": 0 },
    overflow: "clip",
    willChange: { default: "auto", ":is([data-open])": "height, opacity" },
    transitionProperty: "height, opacity",
    transitionDuration: { default: "200ms", "@media (prefers-reduced-motion: reduce)": "0ms" },
    transitionTimingFunction: "cubic-bezier(0.25, 0.46, 0.45, 0.94), ease-out",
  },
  groupContent: {
    height: {
      default: "var(--accordion-panel-height)",
      ":is([data-starting-style])": 0,
      ":is([data-ending-style])": 0,
    },
  },
  body: { padding: 8 },
});
