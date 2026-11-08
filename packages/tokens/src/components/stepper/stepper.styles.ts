import * as stylex from "@stylexjs/stylex";
import { tokens } from "../../tokens.stylex.const.js";
import { focusRing } from "../../focus-ring.stylex.const.js";

// Owner-supplied Apple kit, Stepper 5415:17699: 92 x 32, two 46 x 32 segments.
export const stepperStyles = stylex.create({
  root: {
    display: "inline-flex",
    position: "relative",
    alignItems: "center",
    borderRadius: 100,
    boxShadow: { default: "none", ":has(input:focus-visible)": focusRing.outer },
  },
  group: {
    display: "inline-flex",
    position: "relative",
    borderRadius: 100,
    backgroundColor: tokens.fillTertiary,
  },
  button: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 46,
    height: 32,
    padding: 0,
    borderWidth: 0,
    backgroundColor: { default: "transparent", ":active": tokens.controlHoverFill },
    color: { default: tokens.labelPrimary, ":disabled": tokens.labelTertiary },
    fontFamily: tokens.fontBody,
    fontSize: 23,
    lineHeight: "24px",
    fontWeight: 400,
    cursor: { default: tokens.cursorInteractive, ":disabled": tokens.cursorDisabled },
    outlineStyle: "none",
    boxShadow: { default: "none", ":focus-visible": focusRing.outer },
    touchAction: "manipulation",
  },
  decrement: {
    borderStartStartRadius: 100,
    borderEndStartRadius: 100,
    borderStartEndRadius: 0,
    borderEndEndRadius: 0,
  },
  increment: {
    borderStartStartRadius: 0,
    borderEndStartRadius: 0,
    borderStartEndRadius: 100,
    borderEndEndRadius: 100,
  },
  separator: {
    position: "absolute",
    insetInlineStart: "50%",
    top: 4,
    width: 1,
    height: 24,
    backgroundColor: tokens.separator,
    pointerEvents: "none",
  },
  input: {
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
});
