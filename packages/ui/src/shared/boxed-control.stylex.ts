import * as stylex from "@stylexjs/stylex";

import { tokens } from "../tokens.stylex.js";

export const boxedControlStyles = stylex.create({
  edge: {
    backgroundColor: {
      default: tokens.colorSurfaceControl,
      "[data-disabled]": tokens.colorSurfaceInteractive,
    },
    borderColor: {
      default: "transparent",
      ":hover": "transparent",
      ":focus-visible": "transparent",
      "[data-popup-open]": "transparent",
      "[data-disabled]": "transparent",
    },
    borderRadius: tokens.radiusControl,
    borderStyle: "solid",
    borderWidth: tokens.sizeBorderControl,
    boxShadow: `0 0 0 ${tokens.sizeBorderControl} ${tokens.elevationControlAmbient}, 0 ${tokens.elevationControlDetailY} ${tokens.elevationControlDetailBlur} ${tokens.elevationControlDetail}, 0 ${tokens.elevationControlKeyY} ${tokens.elevationControlKeyBlur} ${tokens.elevationControlKeySpread} ${tokens.elevationControlKey}`,
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
