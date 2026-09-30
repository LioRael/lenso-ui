// HeroUI v3.2.6, Apache-2.0.
import * as stylex from "@stylexjs/stylex";
import { tokens } from "../../tokens.stylex.const.js";
export { inputGroupStyles as numberFieldGroupStyles } from "../input-group/input-group.styles.js";
export const numberFieldStyles = stylex.create({
  root: { display: "flex", flexDirection: "column", gap: 4 },
  input: {
    flex: 1,
    width: 0,
    minWidth: 0,
    border: 0,
    backgroundColor: "transparent",
    color: tokens.fieldForeground,
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
    alignSelf: "stretch",
    width: 40,
    flexShrink: 0,
    border: 0,
    backgroundColor: { default: "transparent", ":active": tokens.defaultHover },
    color: tokens.fieldForeground,
    outline: { default: "none", ":focus-visible": `2px solid ${tokens.focus}` },
    outlineOffset: -2,
    cursor: "pointer",
    opacity: { default: 1, "[data-disabled]": tokens.disabledOpacity },
  },
  increment: { borderInlineStart: `1px solid ${tokens.fieldBorder}` },
  decrement: { borderInlineEnd: `1px solid ${tokens.fieldBorder}` },
});
