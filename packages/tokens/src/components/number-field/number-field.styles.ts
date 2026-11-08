// Modified by Lenso contributors: translated component styling to StyleX.
import * as stylex from "@stylexjs/stylex";
import { tokens } from "../../tokens.stylex.const.js";
import { inputGroupStyles } from "../input-group/input-group.styles.js";
export const numberFieldGroupStyles = {
  ...inputGroupStyles,
  root: [inputGroupStyles.root, inputGroupStyles.focusWithin],
};
export const numberFieldStyles = stylex.create({
  root: { display: "flex", flexDirection: "column", gap: 4 },
  input: {
    flex: 1,
    width: 0,
    minWidth: 0,
    border: 0,
    backgroundColor: "transparent",
    color: tokens.labelPrimary,
    outline: "none",
    paddingInline: 12,
    paddingBlock: 8,
    fontSize: { default: 16, "@media (min-width: 640px)": 14 },
    lineHeight: "20px",
    fontVariantNumeric: "tabular-nums",
  },
  button: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    height: 32,
    borderRadius: 16,
    width: 32,
    flexShrink: 0,
    border: 0,
    backgroundColor: { default: "transparent", ":active": tokens.controlHoverFill },
    color: tokens.labelPrimary,
    outline: { default: "none", ":focus-visible": "1.5px solid var(--lenso-focus-ring)" },
    outlineOffset: -2,
    boxShadow: "none",
    cursor: "pointer",
    opacity: { default: 1, "[data-disabled]": 0.5 },
  },
  increment: { borderInlineStart: `1px solid ${tokens.controlFieldBorder}` },
  decrement: { borderInlineEnd: `1px solid ${tokens.controlFieldBorder}` },
});
