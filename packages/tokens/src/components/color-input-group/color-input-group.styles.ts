/**
 * Copyright NextUI Inc. Apache-2.0.
 * Modified for Lenso StyleX.
 */
import * as stylex from "@stylexjs/stylex";
import { focusRing } from "../../focus-ring.stylex.const.js";
import { tokens } from "../../tokens.stylex.const.js";

export const colorInputGroupStyles = stylex.create({
  root: {
    display: "inline-flex",
    height: 34,
    alignItems: "center",
    overflow: "hidden",
    borderRadius: 8,
    paddingInline: 8,
    borderWidth: 0,
    borderStyle: "solid",
    borderColor: tokens.controlFieldBorder,
    backgroundColor: tokens.fillTertiary,
    color: tokens.labelPrimary,
    fontSize: 17,
    "--lenso-focus-elevation": "0 0 #0000",
    boxShadow: focusRing.elevation,
    outline: {
      default: "none",
      ":has(input:focus-visible):not(:is([data-lenso-focus-method='pointer'] *))":
        "1.5px solid var(--lenso-focus-ring)",
      ":is([data-field-grouped] *, [data-slot='fieldset-row'] *):has(:focus-visible):not(:is([data-lenso-focus-method='pointer'] *))":
        "none",
    },
    outlineOffset: 2,
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
  focused: {
    borderColor: tokens.controlFieldBorder,
    backgroundColor: tokens.fillTertiary,
    boxShadow: focusRing.elevation,
  },
  invalid: {
    borderColor: tokens.statusErrorIndicator,
    backgroundColor: tokens.controlFieldFocusFill,
    boxShadow: { default: focusRing.errorUnderline, ":focus-within": focusRing.errorUnderline },
  },
  disabled: { opacity: 0.5 },
  input: {
    flex: 1,
    minWidth: 0,
    borderWidth: 0,
    backgroundColor: "transparent",
    color: tokens.labelPrimary,
    paddingInlineStart: 0,
    paddingInlineEnd: 0,
    paddingBlock: 0,
    fontSize: 17,
    outline: "none",
  },
  prefix: {
    display: "flex",
    alignItems: "center",
    flexShrink: 0,
    marginInlineStart: 0,
    color: tokens.labelPlaceholder,
  },
  suffix: {
    display: "flex",
    alignItems: "center",
    flexShrink: 0,
    marginInlineEnd: 0,
    color: tokens.labelPlaceholder,
  },
});
