// HeroUI v3.2.6, Apache-2.0.
import * as stylex from "@stylexjs/stylex";
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
    boxShadow: tokens.fieldShadow,
    textAlign: "center",
    fontSize: 18,
    lineHeight: "24px",
    fontWeight: 600,
    fontVariantNumeric: "tabular-nums",
    outline: { default: "none", ":focus-visible": `2px solid ${tokens.focus}` },
    outlineOffset: 2,
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
    boxShadow: "none",
  },
});
