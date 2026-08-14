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
    borderStyle: "none",
    borderWidth: 0,
    boxSizing: "border-box",
    boxShadow: `inset 0 0 0 1px ${tokens.colorLabelBorder}`,
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
    fontSize: "13px",
    fontWeight: 500,
    gap: tokens.spaceLabelGap,
    height: tokens.sizeLabel,
    justifyContent: "center",
    letterSpacing: 0,
    lineHeight: "15.5px",
    outline: {
      default: "none",
      ":focus-visible": `1px solid ${tokens.colorFocusRing}`,
    },
    outlineOffset: "1px",
    paddingBlock: 0,
    paddingInline: "8px",
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
