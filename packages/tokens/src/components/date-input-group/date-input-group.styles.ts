/**
 * Copyright NextUI Inc. Apache-2.0.
 * Modified: compiled StyleX parts replace Tailwind selectors.
 */
import * as stylex from "@stylexjs/stylex";
import { focusRing } from "../../focus-ring.stylex.const.js";
import { tokens } from "../../tokens.stylex.const.js";

export const dateInputGroupStyles = stylex.create({
  root: {
    display: "inline-flex",
    minHeight: 34,
    boxSizing: "border-box",
    maxWidth: "100%",
    alignItems: "center",
    overflow: "hidden",
    borderRadius: 6,
    paddingInline: 11,
    borderWidth: 0,
    borderStyle: "solid",
    borderColor: tokens.controlFieldBorder,
    backgroundColor: tokens.fillTertiary,
    color: tokens.labelPrimary,
    fontSize: 17,
    lineHeight: "22px",
    fontVariantNumeric: "tabular-nums",
    "--lenso-focus-elevation": "0 0 #0000",
    boxShadow: focusRing.elevation,
    outline: {
      default: "none",
      ":has(input:focus-visible, [data-date-segment]:focus-visible):not(:is([data-lenso-focus-method='pointer'] *))":
        "1.5px solid var(--lenso-focus-ring)",
      ":is([data-field-grouped] *, [data-slot='fieldset-row'] *):has(:focus-visible):not(:is([data-lenso-focus-method='pointer'] *))":
        "none",
    },
    outlineOffset: 2,
    transitionProperty: "background-color, border-color, box-shadow",
    transitionDuration: { default: "150ms", "@media (prefers-reduced-motion: reduce)": "0ms" },
    transitionTimingFunction: tokens.motionEaseSmooth,
  },
  fullWidth: { width: "100%" },
  secondary: {
    backgroundColor: {
      default: tokens.controlFill,
      ":hover:not(:focus-within)": tokens.controlHoverFill,
    },
    "--lenso-focus-elevation": "0 0 #0000",
  },
  hovered: { borderColor: tokens.controlBorder, backgroundColor: tokens.controlFieldHoverFill },
  secondaryHovered: { backgroundColor: tokens.controlHoverFill },
  focused: {
    borderColor: {
      default: tokens.controlFieldBorder,
      ":has([data-slot='date-picker-trigger']:focus,[data-slot='date-range-picker-trigger']:focus)":
        tokens.controlFieldBorder,
    },
    backgroundColor: {
      default: tokens.fillTertiary,
      ":has([data-slot='date-picker-trigger']:focus,[data-slot='date-range-picker-trigger']:focus)":
        tokens.controlFieldFill,
    },
    boxShadow: {
      default: focusRing.elevation,
      ":has([data-slot='date-picker-trigger']:focus,[data-slot='date-range-picker-trigger']:focus)":
        focusRing.elevation,
    },
  },
  invalid: {
    borderColor: tokens.statusErrorIndicator,
    backgroundColor: tokens.controlFieldFocusFill,
    boxShadow: { default: focusRing.errorUnderline, ":focus-within": focusRing.errorUnderline },
  },
  disabled: { opacity: 0.5, pointerEvents: "none" },
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
    paddingInlineStart: 0,
    paddingInlineEnd: 0,
    paddingBlock: 0,
    fontSize: 17,
    lineHeight: "22px",
    fontVariantNumeric: "tabular-nums",
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
  segmentField: { display: "contents" },
  hiddenControl: {
    position: "absolute",
    width: 1,
    height: 1,
    padding: 0,
    margin: -1,
    borderWidth: 0,
    overflow: "hidden",
    clipPath: "inset(50%)",
    whiteSpace: "nowrap",
  },
  segmentInput: {
    borderWidth: 0,
    backgroundColor: "transparent",
    color: "inherit",
    font: "inherit",
    minWidth: 0,
    boxSizing: "content-box",
    paddingBlock: 0,
  },
  segment: {
    display: "inline-block",
    borderRadius: tokens.shapeContentMd,
    paddingInline: 2,
    textAlign: "end",
    whiteSpace: "nowrap",
    outline: "none",
  },
  literal: { padding: 0, color: tokens.labelSecondary },
  placeholder: { color: tokens.labelPlaceholder },
  segmentFocused: { backgroundColor: tokens.controlTintSubtleFill, color: tokens.tintText },
  segmentInvalid: { color: tokens.statusErrorText },
  segmentInvalidFocused: {
    backgroundColor: tokens.controlStatusErrorSoftFill,
    color: tokens.statusErrorText,
  },
  prefix: {
    pointerEvents: "none",
    flexShrink: 0,
    color: tokens.labelPlaceholder,
    marginInlineStart: 0,
    display: "flex",
    alignItems: "center",
  },
  suffix: {
    pointerEvents: "none",
    flexShrink: 0,
    color: tokens.labelPlaceholder,
    marginInlineEnd: 0,
    display: "flex",
    alignItems: "center",
  },
});
