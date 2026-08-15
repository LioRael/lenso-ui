import * as stylex from "@stylexjs/stylex";

import { tokens } from "../tokens.stylex.js";

const defaultThumbFeedbackFromUnchecked = stylex.keyframes({
  "0%, 100%": { left: "9px", width: "14px" },
  "40%, 60%": { left: "7px", width: "16px" },
});

const compactThumbFeedbackFromUnchecked = stylex.keyframes({
  "0%, 100%": { left: "8px", width: "10px" },
  "40%, 60%": { left: "6px", width: "12px" },
});

const defaultThumbFeedbackFromChecked = stylex.keyframes({
  "0%, 100%": { left: "9px", width: "14px" },
  "40%, 60%": { left: "7px", width: "16px" },
});

const compactThumbFeedbackFromChecked = stylex.keyframes({
  "0%, 100%": { left: "8px", width: "10px" },
  "40%, 60%": { left: "6px", width: "12px" },
});

export const switchState = stylex.defineVars({
  focus: "transparent",
  focusHeight: "26px",
  focusWidth: "36px",
  overlay: "transparent",
  thumbHeight: "14px",
  thumbLeft: "9px",
  thumbTop: "9px",
  thumbTranslate: "10px",
  thumbTranslateOffset: "0px",
  thumbWidth: "14px",
  track: tokens.colorSwitchTrackOff,
  trackHeight: "20px",
  trackWidth: "30px",
});

export const styles = stylex.create({
  root: {
    [switchState.focus]: {
      default: "transparent",
      ":focus-visible": tokens.colorFocusRing,
      '[data-visual-state="focus-visible"]': tokens.colorFocusRing,
    },
    [switchState.overlay]: {
      default: "transparent",
      ":active": tokens.colorInteractionPressedOverlay,
      '[data-visual-state="pressed"]': tokens.colorInteractionPressedOverlay,
    },
    alignItems: "center",
    backgroundColor: "transparent",
    borderStyle: "none",
    borderWidth: 0,
    boxSizing: "border-box",
    color: { default: tokens.colorContentPrimary, "[data-disabled]": tokens.colorContentTertiary },
    cursor: { default: "pointer", "[data-disabled]": "default" },
    display: "inline-flex",
    flexShrink: 0,
    fontFamily: tokens.fontSans,
    fontSize: "13px",
    fontWeight: 400,
    lineHeight: "16px",
    outline: "none",
    paddingBlock: 0,
    paddingRight: 0,
    position: "relative",
    userSelect: "none",
    whiteSpace: "nowrap",
  },
  defaultSize: {
    [switchState.track]: {
      default: tokens.colorSwitchTrackOff,
      ":hover": tokens.colorSwitchTrackOffHover,
      ":active": tokens.colorSwitchTrackOffHover,
      '[data-visual-state="hover"]': tokens.colorSwitchTrackOffHover,
      '[data-visual-state="pressed"]': tokens.colorSwitchTrackOffHover,
      "[data-disabled]": tokens.colorSwitchTrackOff,
    },
    [switchState.thumbWidth]: {
      default: "14px",
      "[data-disabled]": "14px",
    },
    gap: tokens.space2,
    height: "32px",
    minWidth: "119px",
    paddingLeft: "44px",
  },
  compact: {
    [switchState.focusHeight]: "20px",
    [switchState.focusWidth]: "28px",
    [switchState.thumbHeight]: "10px",
    [switchState.thumbLeft]: "8px",
    [switchState.thumbTop]: "8px",
    [switchState.thumbTranslate]: "8px",
    [switchState.track]: {
      default: tokens.colorSwitchTrackOffCompact,
      ":hover": tokens.colorSwitchTrackOffCompact,
      ":active": tokens.colorSwitchTrackOffCompact,
      '[data-visual-state="hover"]': tokens.colorSwitchTrackOffCompact,
      '[data-visual-state="pressed"]': tokens.colorSwitchTrackOffCompact,
      "[data-disabled]": tokens.colorSwitchTrackOffCompact,
    },
    [switchState.trackHeight]: "14px",
    [switchState.trackWidth]: "22px",
    [switchState.thumbWidth]: {
      default: "10px",
      "[data-disabled]": "10px",
    },
    height: "26px",
    overflow: "visible",
    paddingLeft: 0,
    width: "34px",
  },
  checked: {
    [switchState.thumbTranslateOffset]: {
      default: "0px",
      "[data-disabled]": "0px",
    },
    [switchState.track]: {
      default: tokens.colorSwitchTrackOn,
      ":hover": tokens.colorSwitchTrackOnHover,
      ":active": tokens.colorSwitchTrackOnHover,
      '[data-visual-state="hover"]': tokens.colorSwitchTrackOnHover,
      '[data-visual-state="pressed"]': tokens.colorSwitchTrackOnHover,
      "[data-disabled]": tokens.colorSwitchTrackOn,
    },
  },
  defaultInteractive: {
    [switchState.thumbWidth]: "16px",
    [switchState.track]: tokens.colorSwitchTrackOffHover,
  },
  compactInteractive: {
    [switchState.thumbWidth]: "12px",
    [switchState.track]: tokens.colorSwitchTrackOffCompact,
  },
  checkedInteractive: {
    [switchState.thumbTranslateOffset]: "-2px",
    [switchState.track]: tokens.colorSwitchTrackOnHover,
  },
  defaultFeedbackFromChecked: {
    animationDelay: "50ms",
    animationDuration: "100ms",
    animationFillMode: "both",
    animationName: defaultThumbFeedbackFromChecked,
    animationTimingFunction: "ease-out",
  },
  defaultFeedbackFromUnchecked: {
    animationDelay: "50ms",
    animationDuration: "100ms",
    animationFillMode: "both",
    animationName: defaultThumbFeedbackFromUnchecked,
    animationTimingFunction: "ease-out",
  },
  compactFeedbackFromChecked: {
    animationDelay: "50ms",
    animationDuration: "100ms",
    animationFillMode: "both",
    animationName: compactThumbFeedbackFromChecked,
    animationTimingFunction: "ease-out",
  },
  compactFeedbackFromUnchecked: {
    animationDelay: "50ms",
    animationDuration: "100ms",
    animationFillMode: "both",
    animationName: compactThumbFeedbackFromUnchecked,
    animationTimingFunction: "ease-out",
  },
  pressed: {
    [switchState.overlay]: tokens.colorInteractionPressedOverlay,
  },
  focusVisible: {
    [switchState.focus]: tokens.colorFocusRing,
  },
  disabled: {
    [switchState.thumbTranslateOffset]: "0px",
    opacity: tokens.opacityDisabled,
  },
  track: {
    backgroundColor: switchState.track,
    borderRadius: tokens.radiusRounded,
    height: switchState.trackHeight,
    left: "6px",
    pointerEvents: "none",
    position: "absolute",
    top: "6px",
    transitionDuration: "150ms",
    transitionProperty: "background-color",
    transitionTimingFunction: "ease-out",
    width: switchState.trackWidth,
  },
  thumb: {
    backgroundColor: tokens.colorSwitchThumb,
    borderRadius: tokens.radiusRounded,
    height: switchState.thumbHeight,
    left: switchState.thumbLeft,
    pointerEvents: "none",
    position: "absolute",
    top: switchState.thumbTop,
    transform: {
      default: "translateX(0)",
      "[data-checked]": `translateX(calc(${switchState.thumbTranslate} + ${switchState.thumbTranslateOffset}))`,
    },
    transitionDelay: "50ms",
    transitionDuration: "100ms",
    transitionProperty: "transform, width",
    transitionTimingFunction: "ease-out",
    width: switchState.thumbWidth,
  },
  pressedLayer: {
    backgroundColor: switchState.overlay,
    borderRadius: tokens.radiusRounded,
    height: switchState.trackHeight,
    left: "6px",
    pointerEvents: "none",
    position: "absolute",
    top: "6px",
    width: switchState.trackWidth,
  },
  focusLayer: {
    backgroundColor: "transparent",
    borderColor: switchState.focus,
    borderRadius: tokens.radiusRounded,
    borderStyle: "solid",
    borderWidth: "1px",
    boxSizing: "border-box",
    height: switchState.focusHeight,
    left: "3px",
    pointerEvents: "none",
    position: "absolute",
    top: "3px",
    width: switchState.focusWidth,
  },
});
