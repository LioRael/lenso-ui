import * as stylex from "@stylexjs/stylex";

import { tokens } from "../tokens.stylex.js";

export const boxedControlStyles = stylex.create({
  edge: {
    backgroundColor: {
      default: tokens.colorSurfaceControl,
      "[data-disabled]": tokens.colorSurfaceInteractive,
    },
    borderColor: {
      default: tokens.colorBorderControl,
      ":hover": tokens.colorBorderPrimary,
      ":focus-visible": tokens.colorBorderControlFocus,
      "[data-popup-open]": tokens.colorBorderControlFocus,
      "[data-disabled]": tokens.colorBorderTertiary,
    },
    borderRadius: tokens.radiusControl,
    borderStyle: "solid",
    borderWidth: tokens.sizeBorderControl,
    boxShadow: "none",
    boxSizing: "border-box",
    outlineColor: {
      default: "transparent",
      ":focus-visible": tokens.colorFocusRing,
    },
    outlineOffset: "0px",
    outlineStyle: "solid",
    outlineWidth: { default: 0, ":focus-visible": "1px" },
  },
});
