/**
 * Derived from HeroUI v3.2.6. Copyright NextUI Inc. Apache-2.0.
 * Modified: compiled StyleX parts replace Tailwind selectors.
 */
import * as stylex from "@stylexjs/stylex";
import { focusRing } from "../../focus-ring.stylex.const.js";
import { tokens } from "../../tokens.stylex.const.js";

export const dateInputGroupStyles = stylex.create({
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
    transitionProperty: "background-color, border-color, box-shadow",
    transitionDuration: { default: "150ms", "@media (prefers-reduced-motion: reduce)": "0ms" },
    transitionTimingFunction: tokens.easeSmooth,
  },
  fullWidth: { width: "100%" },
  secondary: {
    backgroundColor: { default: tokens.default, ":hover:not(:focus-within)": tokens.defaultHover },
    "--lenso-focus-elevation": "0 0 #0000",
  },
  hovered: { borderColor: tokens.fieldBorderHover, backgroundColor: tokens.fieldHover },
  secondaryHovered: { backgroundColor: tokens.defaultHover },
  focused: {
    borderColor: {
      default: tokens.fieldBorderFocus,
      ":has([data-slot='date-picker-trigger']:focus,[data-slot='date-range-picker-trigger']:focus)":
        tokens.fieldBorder,
    },
    backgroundColor: {
      default: tokens.fieldFocus,
      ":has([data-slot='date-picker-trigger']:focus,[data-slot='date-range-picker-trigger']:focus)":
        tokens.fieldBackground,
    },
    outline: "none",
    boxShadow: {
      default: focusRing.fieldElevated,
      ":has([data-slot='date-picker-trigger']:focus,[data-slot='date-range-picker-trigger']:focus)":
        focusRing.elevation,
    },
  },
  invalid: { borderColor: tokens.danger, backgroundColor: tokens.fieldFocus },
  disabled: { opacity: tokens.disabledOpacity, pointerEvents: "none" },
  input: {
    display: "flex",
    flex: {
      default: 1,
      ":is([data-slot='date-input-group']:has([data-slot='date-range-picker-range-separator']) [slot='start'])":
        "none",
    },
    cursor: "text",
    alignItems: "center",
    gap: 1,
    borderRadius: 0,
    borderWidth: 0,
    backgroundColor: "transparent",
    paddingInlineStart: {
      default: 12,
      ":is([data-slot='date-input-group']:has([data-slot='date-input-group-prefix']) [data-slot='date-input-group-input'])": 8,
      ":is([data-slot='date-input-group']:has([data-slot='date-range-picker-range-separator']) [slot='end'])": 0,
    },
    paddingInlineEnd: {
      default: 12,
      ":is([data-slot='date-input-group']:has([data-slot='date-input-group-suffix']) [data-slot='date-input-group-input'])": 8,
      ":is([data-slot='date-input-group']:has([data-slot='date-range-picker-range-separator']) [slot='start'])": 0,
    },
    paddingBlock: 8,
    fontSize: { default: 16, "@media (min-width: 640px)": 14 },
    boxShadow: "none",
    outline: "none",
  },
  inputContainer: {
    display: "flex",
    flex: 1,
    alignItems: "center",
    width: "fit-content",
    overflowX: "auto",
    overflowY: "clip",
    scrollbarWidth: "none",
  },
  segment: {
    display: "inline-block",
    borderRadius: tokens.radiusMd,
    paddingInline: 2,
    textAlign: "end",
    whiteSpace: "nowrap",
    outline: "none",
  },
  literal: { padding: 0, color: tokens.muted },
  placeholder: { color: tokens.fieldPlaceholder },
  segmentFocused: { backgroundColor: tokens.accentSoft, color: tokens.accentSoftForeground },
  segmentInvalid: { color: tokens.danger },
  segmentInvalidFocused: { backgroundColor: tokens.dangerSoft, color: tokens.dangerSoftForeground },
  prefix: {
    pointerEvents: "none",
    flexShrink: 0,
    color: tokens.fieldPlaceholder,
    marginInlineStart: 12,
    display: "flex",
    alignItems: "center",
  },
  suffix: {
    pointerEvents: "none",
    flexShrink: 0,
    color: tokens.fieldPlaceholder,
    marginInlineEnd: 12,
    display: "flex",
    alignItems: "center",
  },
});
