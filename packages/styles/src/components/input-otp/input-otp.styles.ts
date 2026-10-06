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
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: {
      default: tokens.fieldBorder,
      ":hover": tokens.fieldBorderHover,
      ":focus": tokens.fieldBorderFocus,
      "[data-invalid]": tokens.danger,
    },
    backgroundColor: tokens.fieldBackground,
    color: tokens.fieldForeground,
    "--lenso-focus-elevation": tokens.fieldShadow,
    boxShadow: { default: focusRing.elevation, ":focus": focusRing.fieldElevated },
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
    backgroundColor: { default: tokens.default, ":hover": tokens.defaultHover },
    "--lenso-focus-elevation": "0 0 #0000",
  },
});
