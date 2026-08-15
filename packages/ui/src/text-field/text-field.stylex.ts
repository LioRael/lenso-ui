import * as stylex from "@stylexjs/stylex";

import { tokens } from "../tokens.stylex.js";

export const styles = stylex.create({
  root: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.space2,
    maxWidth: "304px",
    width: "100%",
  },
  label: {
    color: tokens.colorContentPrimary,
    fontFamily: tokens.fontSans,
    fontSize: "13px",
    fontWeight: 500,
    lineHeight: "16px",
  },
  control: {
    backgroundColor: {
      default: tokens.colorSurfaceControl,
      "[data-read-only]": tokens.colorSurfaceReadOnly,
      ":disabled": tokens.colorSurfaceInteractive,
    },
    borderColor: {
      default: tokens.colorBorderControl,
      ":hover": tokens.colorBorderPrimary,
      ":focus-visible": tokens.colorBorderControlFocus,
      "[data-invalid]": tokens.colorStatusErrorBorder,
      '[data-visual-state="hover"]': tokens.colorBorderPrimary,
      '[data-visual-state="active"]': tokens.colorBorderControlFocus,
      '[data-visual-state="focus-visible"]': tokens.colorBorderControlFocus,
      ":disabled": tokens.colorBorderTertiary,
      "[data-read-only]": tokens.colorBorderTertiary,
    },
    borderRadius: tokens.radiusControl,
    borderStyle: "solid",
    borderWidth: tokens.sizeBorderControl,
    boxSizing: "border-box",
    color: tokens.colorContentPrimary,
    fontFamily: tokens.fontSans,
    fontSize: "13px",
    height: tokens.sizeInputDefault,
    lineHeight: "16px",
    outlineColor: {
      default: "transparent",
      ":focus-visible": tokens.colorFocusRing,
      '[data-visual-state="active"]': tokens.colorFocusRing,
      '[data-visual-state="focus-visible"]': tokens.colorFocusRing,
    },
    outlineOffset: "0px",
    outlineStyle: "solid",
    outlineWidth: {
      default: 0,
      ":focus-visible": "1px",
      '[data-visual-state="active"]': "1px",
      '[data-visual-state="focus-visible"]': "1px",
    },
    paddingBlock: "6px",
    paddingInline: tokens.space3,
    width: "100%",
    "::placeholder": { color: tokens.colorContentTertiary },
  },
  description: {
    color: tokens.colorContentTertiary,
    fontFamily: tokens.fontSans,
    fontSize: "12px",
    lineHeight: "16px",
    margin: 0,
  },
  error: {
    color: tokens.colorStatusErrorContent,
    fontFamily: tokens.fontSans,
    fontSize: "12px",
    lineHeight: "16px",
    margin: 0,
  },
});
