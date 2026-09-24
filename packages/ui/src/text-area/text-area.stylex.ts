import * as stylex from "@stylexjs/stylex";

import { tokens } from "../tokens.stylex.js";
import { motion } from "../shared/motion.stylex.js";

export const styles = stylex.create({
  root: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.space2,
    width: "100%",
  },
  label: {
    color: tokens.colorContentPrimary,
    fontFamily: tokens.fontSans,
    fontSize: tokens.typeLabelSize,
    fontWeight: 500,
    lineHeight: tokens.typeLabelLineHeight,
  },
  control: {
    backgroundColor: {
      default: tokens.colorSurfaceControl,
      "[data-read-only]": tokens.colorSurfaceReadOnly,
      ":disabled": tokens.colorSurfaceInteractive,
    },
    borderColor: {
      default: tokens.colorBorderControl,
      ":hover": {
        default: null,
        "@media (hover: hover) and (pointer: fine)": tokens.colorBorderControlFocus,
      },
      "[data-invalid]": tokens.colorStatusErrorBorder,
      '[data-visual-state="hover"]': tokens.colorBorderControlFocus,
      ":disabled": tokens.colorBorderTertiary,
      "[data-read-only]": tokens.colorBorderTertiary,
    },
    borderRadius: tokens.radiusControl,
    borderStyle: "solid",
    borderWidth: tokens.sizeBorderControl,
    boxSizing: "border-box",
    color: tokens.colorContentPrimary,
    fontFamily: tokens.fontSans,
    fontSize: tokens.typeLabelSize,
    lineHeight: tokens.typeLabelLineHeight,
    minHeight: "96px",
    outlineColor: {
      default: "transparent",
      ":focus-visible": tokens.colorFocusRing,
      '[data-visual-state="active"]': tokens.colorFocusRing,
      '[data-visual-state="focus-visible"]': tokens.colorFocusRing,
    },
    outlineOffset: "-1px",
    outlineStyle: "solid",
    outlineWidth: {
      default: 0,
      ":focus-visible": "2px",
      '[data-visual-state="active"]': "2px",
      '[data-visual-state="focus-visible"]': "2px",
    },
    paddingBlock: tokens.space2,
    paddingInline: tokens.space3,
    resize: "vertical",
    transitionDuration: motion.durationFast,
    transitionProperty: "background-color, border-color, outline-color",
    transitionTimingFunction: motion.easeHover,
    width: "100%",
    "::placeholder": { color: tokens.colorContentTertiary },
  },
  description: {
    color: tokens.colorContentTertiary,
    fontFamily: tokens.fontSans,
    fontSize: tokens.typeMetadataSize,
    lineHeight: tokens.typeLabelLineHeight,
    margin: 0,
  },
  error: {
    color: tokens.colorStatusErrorContent,
    fontFamily: tokens.fontSans,
    fontSize: tokens.typeMetadataSize,
    lineHeight: tokens.typeLabelLineHeight,
    margin: 0,
  },
});
