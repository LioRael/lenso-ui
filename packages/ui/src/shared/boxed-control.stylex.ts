import * as stylex from "@stylexjs/stylex";

import { tokens } from "../tokens.stylex.js";
import { motion } from "./motion.stylex.js";

export const boxedControlStyles = stylex.create({
  edge: {
    backgroundColor: {
      default: tokens.colorSurfaceControl,
      "[data-disabled]": tokens.colorSurfaceInteractive,
    },
    borderColor: {
      default: tokens.colorBorderControl,
      ":hover": tokens.colorBorderControlFocus,
      ":focus-visible": "transparent",
      "[data-popup-open]": "transparent",
      "[data-disabled]": "transparent",
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
    outlineWidth: { default: 0, ":focus-visible": "2px" },
    transitionDuration: motion.durationFast,
    transitionProperty: "background-color, border-color, box-shadow, outline-color",
    transitionTimingFunction: motion.easeHover,
  },
});
