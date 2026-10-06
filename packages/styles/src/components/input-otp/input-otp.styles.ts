// HeroUI v3.2.6, Apache-2.0.
// Modified by Lenso contributors: translated component styling to StyleX.
import * as stylex from "@stylexjs/stylex";
import { focusRing } from "../../focus-ring.stylex.const.js";
import { tokens } from "../../tokens.stylex.const.js";
export const inputOTPStyles = stylex.create({
  root: { position: "relative", display: "flex", width: "100%", alignItems: "center", gap: 8 },
  group: { display: "flex", alignItems: "center", gap: 8 },
  slot: {
    width: 38,
    height: 40,
    minWidth: 0,
    flex: 1,
    borderRadius: tokens.fieldRadius,
    borderWidth: tokens.borderWidthField,
    borderStyle: "solid",
    borderColor: {
      default: tokens.fieldBorder,
      ":hover": tokens.fieldBorderHover,
      "[data-invalid]": tokens.danger,
    },
    backgroundColor: {
      default: tokens.fieldBackground,
      "@media (hover: hover)": { ":hover": tokens.fieldHover },
      ":focus": tokens.fieldFocus,
      "[data-filled]": tokens.fieldFocus,
    },
    color: tokens.fieldForeground,
    "--lenso-focus-elevation": tokens.fieldShadow,
    boxShadow: { default: focusRing.elevation, ":focus": focusRing.fieldElevated },
    zIndex: { ":focus": 10 },
    transition: {
      default: `background-color 150ms ${tokens.easeSmooth}, border-color 150ms ${tokens.easeSmooth}, box-shadow 150ms ${tokens.easeOut}`,
      "@media (prefers-reduced-motion: reduce)": "none",
    },
    textAlign: "center",
    fontSize: 18,
    lineHeight: "24px",
    fontWeight: 600,
    fontVariantNumeric: "tabular-nums",
    outline: "none",
    opacity: { default: 1, "[data-disabled]": tokens.disabledOpacity },
  },
  separator: {
    height: 2,
    width: 6,
    flexShrink: 0,
    borderRadius: tokens.radiusSm,
    backgroundColor: tokens.separator,
  },
  secondary: {
    backgroundColor: {
      default: tokens.default,
      "@media (hover: hover)": { ":hover": tokens.defaultHover },
      ":focus": tokens.default,
      "[data-filled]": tokens.default,
    },
    "--lenso-focus-elevation": "0 0 #0000",
  },
});
