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
      default: tokens.colorSurfaceSurface,
      ":disabled": tokens.colorSurfaceInteractive,
      ":read-only": tokens.colorSurfaceReadOnly,
    },
    borderColor: {
      default: tokens.colorBorderSecondary,
      ":hover": tokens.colorBorderPrimary,
      "[data-invalid]": tokens.colorStatusErrorBorder,
      ":disabled": tokens.colorBorderTertiary,
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
    },
    outlineOffset: "0px",
    outlineStyle: "solid",
    outlineWidth: {
      default: 0,
      ":focus-visible": "1px",
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
  },
  error: {
    color: tokens.colorStatusErrorContent,
    fontFamily: tokens.fontSans,
    fontSize: "12px",
    lineHeight: "16px",
  },
});
