import * as stylex from "@stylexjs/stylex";

import { tokens } from "../tokens.stylex.js";

export const styles = stylex.create({
  backdrop: {
    backgroundColor: tokens.colorSurfaceScrim,
    inset: 0,
    position: "fixed",
  },
  viewport: {
    alignItems: "center",
    display: "flex",
    inset: 0,
    justifyContent: "center",
    padding: tokens.space4,
    position: "fixed",
  },
  popup: {
    backgroundColor: tokens.colorSurfaceDialog,
    borderColor: tokens.colorBorderDialog,
    borderRadius: tokens.radiusPopover,
    borderStyle: "solid",
    borderWidth: tokens.sizeBorderDialog,
    boxShadow:
      "0 1px 1px rgba(0,0,0,0.04), 0 6px 24px rgba(0,0,0,0.10), 0 9px 48px rgba(0,0,0,0.08)",
    boxSizing: "border-box",
    color: tokens.colorContentPrimary,
    maxHeight: "calc(100vh - 32px)",
    maxWidth: "calc(100vw - 32px)",
    overflow: "auto",
    padding: tokens.space6,
    position: "relative",
    width: tokens.sizeDialog,
  },
  title: {
    color: tokens.colorContentPrimary,
    fontFamily: tokens.fontSans,
    fontSize: "15px",
    fontWeight: 600,
    lineHeight: "23px",
    margin: 0,
  },
  description: {
    color: tokens.colorContentSecondary,
    fontFamily: tokens.fontSans,
    fontSize: "12px",
    lineHeight: "18px",
    marginBlock: tokens.space4,
  },
  close: {
    alignItems: "center",
    backgroundColor: {
      default: "transparent",
      ":hover": tokens.colorSurfaceQuaternary,
    },
    border: 0,
    borderRadius: tokens.radiusRounded,
    color: tokens.colorContentSecondary,
    cursor: "pointer",
    display: "inline-flex",
    height: tokens.sizeIconButtonDefault,
    justifyContent: "center",
    padding: 0,
    position: "absolute",
    right: "20px",
    top: "20px",
    width: tokens.sizeIconButtonDefault,
  },
  closeIcon: {
    alignItems: "center",
    color: "currentColor",
    display: "inline-flex",
    height: tokens.sizeIconDefault,
    justifyContent: "center",
    width: tokens.sizeIconDefault,
  },
});
