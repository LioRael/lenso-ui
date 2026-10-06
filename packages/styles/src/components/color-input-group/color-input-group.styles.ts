/**
 * Derived from HeroUI v3.2.6. Copyright NextUI Inc. Apache-2.0.
 * Modified for Lenso StyleX.
 */
import * as stylex from "@stylexjs/stylex";
import { focusRing } from "../../focus-ring.stylex.const.js";
import { tokens } from "../../tokens.stylex.const.js";

export const colorInputGroupStyles = stylex.create({
  root: {
    display: "inline-flex",
    height: 36,
    alignItems: "center",
    overflow: "hidden",
    borderRadius: tokens.fieldRadius,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: tokens.fieldBorder,
    backgroundColor: tokens.fieldBackground,
    color: tokens.fieldForeground,
    fontSize: 14,
    "--lenso-focus-elevation": tokens.fieldShadow,
    boxShadow: focusRing.elevation,
    outline: "none",
  },
  fullWidth: { width: "100%" },
  secondary: {
    backgroundColor: { default: tokens.default, ":hover:not(:focus-within)": tokens.defaultHover },
    "--lenso-focus-elevation": "0 0 #0000",
  },
  hovered: { borderColor: tokens.fieldBorderHover, backgroundColor: tokens.fieldHover },
  focused: {
    borderColor: tokens.fieldBorderFocus,
    backgroundColor: tokens.fieldFocus,
    outline: "none",
    boxShadow: focusRing.fieldElevated,
  },
  invalid: { borderColor: tokens.danger, backgroundColor: tokens.fieldFocus },
  disabled: { opacity: tokens.disabledOpacity },
  input: {
    flex: 1,
    minWidth: 0,
    borderWidth: 0,
    backgroundColor: "transparent",
    color: tokens.fieldForeground,
    paddingInlineStart: {
      default: 12,
      ":is([data-slot='color-input-group']:has([data-slot='color-input-group-prefix']) [data-slot='color-input-group-input'])": 8,
    },
    paddingInlineEnd: {
      default: 12,
      ":is([data-slot='color-input-group']:has([data-slot='color-input-group-suffix']) [data-slot='color-input-group-input'])": 8,
    },
    paddingBlock: 8,
    fontSize: { default: 16, "@media (min-width: 640px)": 14 },
    outline: "none",
  },
  prefix: {
    display: "flex",
    alignItems: "center",
    flexShrink: 0,
    marginInlineStart: 12,
    color: tokens.fieldPlaceholder,
  },
  suffix: {
    display: "flex",
    alignItems: "center",
    flexShrink: 0,
    marginInlineEnd: 12,
    color: tokens.fieldPlaceholder,
  },
});
