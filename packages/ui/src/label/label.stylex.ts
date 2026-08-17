import * as stylex from "@stylexjs/stylex";

import { tokens } from "../tokens.stylex.js";

export const styles = stylex.create({
  root: {
    alignItems: "center",
    backgroundColor: {
      default: tokens.colorLabelSurfaceDefault,
      ":hover": tokens.colorLabelSurfaceHover,
      ":active": tokens.colorLabelSurfaceHover,
      '[data-visual-state="hover"]': tokens.colorLabelSurfaceHover,
      '[data-visual-state="active"]': tokens.colorLabelSurfaceHover,
    },
    borderRadius: tokens.radiusRounded,
    borderColor: tokens.colorLabelBorder,
    borderStyle: "solid",
    borderWidth: tokens.sizeBorderControl,
    boxSizing: "border-box",
    color: {
      default: tokens.colorLabelContentDefault,
      ":hover": tokens.colorLabelContentHover,
      ":active": tokens.colorLabelContentHover,
      '[data-visual-state="hover"]': tokens.colorLabelContentHover,
      '[data-visual-state="active"]': tokens.colorLabelContentHover,
    },
    cursor: "pointer",
    display: "inline-flex",
    flexShrink: 0,
    fontFamily: tokens.fontSans,
    fontSize: "12px",
    fontWeight: 400,
    gap: tokens.spaceLabelGap,
    height: tokens.sizeLabel,
    justifyContent: "center",
    letterSpacing: 0,
    lineHeight: "14.5px",
    outline: {
      default: "none",
      ":focus-visible": `1px solid ${tokens.colorFocusRing}`,
    },
    outlineOffset: "0px",
    paddingBlock: 0,
    paddingInline: "8px",
    textAlign: "left",
    transitionDuration: "0s",
    whiteSpace: "nowrap",
  },
  open: {
    backgroundColor: tokens.colorLabelSurfaceOpen,
    color: tokens.colorLabelContentHover,
  },
  marker: {
    borderRadius: tokens.radiusRounded,
    display: "inline-flex",
    flexShrink: 0,
    height: tokens.sizeLabelMarker,
    width: tokens.sizeLabelMarker,
  },
  red: {
    backgroundColor: tokens.colorLabelMarkerRed,
  },
  violet: {
    backgroundColor: tokens.colorLabelMarkerPurple,
  },
  blue: {
    backgroundColor: tokens.colorLabelMarkerBlue,
  },
});
