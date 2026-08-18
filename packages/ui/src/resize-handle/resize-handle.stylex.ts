import * as stylex from "@stylexjs/stylex";

import { tokens } from "../tokens.stylex.js";

export const resizeHandleState = stylex.defineVars({
  color: tokens.colorContentPrimary,
  opacity: 0,
});

const transparent = `color-mix(in srgb, ${resizeHandleState.color} 0%, transparent)`;
const soft = `color-mix(in srgb, ${resizeHandleState.color} 50%, transparent)`;
const strong = `color-mix(in srgb, ${resizeHandleState.color} 65%, transparent)`;

export const styles = stylex.create({
  dragging: {
    [resizeHandleState.opacity]: 1,
  },
  focusVisible: {
    [resizeHandleState.color]: tokens.colorFocusRing,
    [resizeHandleState.opacity]: 1,
  },
  horizontalIndicator: {
    backgroundImage: `linear-gradient(to right, ${transparent} 0%, ${soft} 15%, ${strong} 50%, ${soft} 85%, ${transparent} 100%)`,
    bottom: "3.5px",
    height: "0.5px",
    left: "12px",
    right: "12px",
  },
  horizontalRoot: {
    cursor: { default: "row-resize", "[data-disabled]": "default" },
    height: "7px",
    minWidth: "32px",
    width: "100%",
  },
  hover: {
    [resizeHandleState.opacity]: 1,
  },
  indicator: {
    borderRadius: "4px",
    opacity: resizeHandleState.opacity,
    pointerEvents: "none",
    position: "absolute",
    transitionDuration: "250ms",
    transitionProperty: "opacity",
    transitionTimingFunction: "ease",
    "@media (prefers-reduced-motion: reduce)": { transitionDuration: "0ms" },
  },
  root: {
    [resizeHandleState.color]: {
      default: tokens.colorContentPrimary,
      ":focus-visible": tokens.colorFocusRing,
    },
    [resizeHandleState.opacity]: {
      default: 0,
      ":hover": 1,
      ":focus-visible": 1,
      "[data-dragging]": 1,
      "[data-disabled]": 0,
    },
    backgroundColor: "transparent",
    borderStyle: "none",
    borderWidth: 0,
    boxSizing: "border-box",
    flexShrink: 0,
    outline: "none",
    padding: 0,
    position: "relative",
    touchAction: "none",
    userSelect: "none",
    zIndex: 1,
  },
  verticalIndicator: {
    backgroundImage: `linear-gradient(to bottom, ${transparent} 0%, ${soft} 15%, ${strong} 50%, ${soft} 85%, ${transparent} 100%)`,
    bottom: "12px",
    left: "3px",
    top: "12px",
    width: "0.5px",
  },
  verticalRoot: {
    cursor: { default: "col-resize", "[data-disabled]": "default" },
    height: "100%",
    minHeight: "32px",
    width: "7px",
  },
});
