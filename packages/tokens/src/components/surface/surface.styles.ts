// modified for StyleX.
import * as stylex from "@stylexjs/stylex";
import { tokens } from "../../tokens.stylex.const.js";
export const surfaceStyles = stylex.create({
  root: { position: "relative", color: tokens.labelPrimary },
});
export const surfaceVariants = stylex.create({
  glass: {
    backgroundColor: "transparent",
    color: "var(--lenso-material-action-label)",
    borderRadius: 20,
    boxShadow: "none",
  },
  default: { color: tokens.labelPrimary },
  secondary: { backgroundColor: tokens.backgroundSecondary, color: tokens.labelPrimary },
  tertiary: { backgroundColor: tokens.backgroundGroupedTertiary, color: tokens.labelPrimary },
  transparent: { backgroundColor: "transparent" },
});

export const groupStyles = stylex.create({
  surface: {
    position: "relative",
    minWidth: 0,
    backgroundColor: tokens.backgroundGroupedSecondary,
    color: tokens.labelPrimary,
    borderRadius: 26,
  },
  group: {
    margin: 0,
    padding: 0,
    borderWidth: 0,
    width: "100%",
    overflow: "clip",
  },
  row: {
    position: "relative",
    boxSizing: "border-box",
    minWidth: 0,
    minHeight: 52,
    paddingInline: 16,
    fontFamily: tokens.fontBody,
    fontSize: 17,
    lineHeight: "22px",
    color: tokens.labelPrimary,
  },
  divided: {
    position: "relative",
    "::after": {
      content: { default: '""', ":last-child": "none" },
      position: "absolute",
      bottom: 0,
      insetInline: 16,
      height: 0.5,
      backgroundColor: tokens.separator,
      pointerEvents: "none",
    },
  },
  fieldFocus: {
    backgroundColor: {
      default: "transparent",
      ":has(input:focus-visible, textarea:focus-visible, [role='combobox']:focus-visible, [role='switch']:focus-visible, [data-date-segment]:focus-visible):not(:is([data-lenso-focus-method='pointer'] *))":
        tokens.fillQuaternary,
    },
    "::before": {
      content: '""',
      position: "absolute",
      insetInlineStart: 6,
      top: "50%",
      transform: "translateY(-50%)",
      width: 2,
      height: 18,
      borderRadius: 1,
      backgroundColor: tokens.focusRing,
      opacity: {
        default: 0,
        ":has(input:focus-visible, textarea:focus-visible, [role='combobox']:focus-visible, [role='switch']:focus-visible, [data-date-segment]:focus-visible):not(:is([data-lenso-focus-method='pointer'] *))": 1,
      },
      pointerEvents: "none",
    },
  },
  separator: { height: 0.5, marginInline: 16, backgroundColor: tokens.separator },
});
