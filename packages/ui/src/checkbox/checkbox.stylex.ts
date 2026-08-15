import * as stylex from "@stylexjs/stylex";

import { tokens } from "../tokens.stylex.js";

export const checkboxState = stylex.defineVars({
  focus: "transparent",
  pressed: "transparent",
});

export const styles = stylex.create({
  root: {
    [checkboxState.focus]: {
      default: null,
      ":focus-visible": tokens.colorFocusRing,
      '[data-visual-state="focus-visible"]': tokens.colorFocusRing,
    },
    [checkboxState.pressed]: {
      default: null,
      ":active": tokens.colorInteractionPressedOverlay,
      '[data-visual-state="pressed"]': tokens.colorInteractionPressedOverlay,
    },
    alignItems: "center",
    backgroundColor: "transparent",
    borderStyle: "none",
    borderWidth: 0,
    boxSizing: "border-box",
    color: {
      default: tokens.colorContentPrimary,
      "[data-disabled]": tokens.colorContentTertiary,
    },
    cursor: { default: "pointer", "[data-disabled]": "default" },
    display: "inline-flex",
    flexShrink: 0,
    fontFamily: tokens.fontSans,
    fontSize: "13px",
    fontWeight: 400,
    gap: tokens.space2,
    height: "28px",
    lineHeight: "16px",
    outline: "none",
    paddingBlock: 0,
    paddingLeft: "3px",
    paddingRight: 0,
    position: "relative",
    transitionDuration: "80ms",
    transitionProperty: "color, opacity",
    transitionTimingFunction: "ease-out",
    userSelect: "none",
    whiteSpace: "nowrap",
  },
  indicator: {
    alignItems: "center",
    backgroundColor: {
      default: "transparent",
      "[data-checked]": tokens.colorContentPrimary,
      "[data-indeterminate]": tokens.colorContentPrimary,
      "[data-disabled][data-checked]": tokens.colorContentTertiary,
      "[data-disabled][data-indeterminate]": tokens.colorContentTertiary,
    },
    borderRadius: "3px",
    boxShadow: {
      default: `inset 0 0 0 1px ${tokens.colorBorderSecondary}`,
      "[data-checked]": "none",
      "[data-indeterminate]": "none",
      "[data-disabled]": `inset 0 0 0 1px ${tokens.colorContentTertiary}`,
      "[data-disabled][data-checked]": "none",
      "[data-disabled][data-indeterminate]": "none",
    },
    boxSizing: "border-box",
    color: { default: tokens.colorContentInverse, "[data-disabled]": tokens.colorContentTertiary },
    display: "inline-flex",
    flexShrink: 0,
    height: "14px",
    justifyContent: "center",
    opacity: {
      default: 1,
      "[data-checked]": 0.9,
      "[data-indeterminate]": 0.9,
      "[data-disabled]": 0.5,
      "[data-disabled][data-checked]": 0.45,
      "[data-disabled][data-indeterminate]": 0.45,
    },
    position: "relative",
    transitionDuration: "80ms",
    transitionProperty: "background-color, box-shadow, opacity",
    transitionTimingFunction: "ease-out",
    width: "14px",
  },
  checkedMark: {
    "::after": {
      backgroundColor: "currentColor",
      content: "''",
      display: "block",
      height: "14px",
      maskImage:
        "url(\"data:image/svg+xml,%3Csvg width='14' height='14' viewBox='0 0 14 14' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M3.85 7L5.95 9.1L10.15 4.9' stroke='black' stroke-width='1.7' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")",
      maskPosition: "center",
      maskRepeat: "no-repeat",
      maskSize: "14px 14px",
      width: "14px",
    },
  },
  indeterminateMark: {
    "::after": {
      backgroundColor: "currentColor",
      content: "''",
      display: "block",
      height: "14px",
      maskImage:
        "url(\"data:image/svg+xml,%3Csvg width='14' height='14' viewBox='0 0 14 14' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M4.2 7H9.8' stroke='black' stroke-width='1.7' stroke-linecap='round'/%3E%3C/svg%3E\")",
      maskPosition: "center",
      maskRepeat: "no-repeat",
      maskSize: "14px 14px",
      width: "14px",
    },
  },
  disabledMark: {
    "::after": {
      display: "none",
    },
  },
  pressedLayer: {
    backgroundColor: checkboxState.pressed,
    borderRadius: "3px",
    inset: 0,
    pointerEvents: "none",
    position: "absolute",
  },
  focusLayer: {
    borderColor: checkboxState.focus,
    borderRadius: "5px",
    borderStyle: "solid",
    borderWidth: "1px",
    inset: "-2px",
    pointerEvents: "none",
    position: "absolute",
  },
  label: {
    color: "inherit",
    display: "inline-block",
    font: "inherit",
    lineHeight: "16px",
  },
});
