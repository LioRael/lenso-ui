import * as stylex from "@stylexjs/stylex";
import { tokens } from "../../tokens.stylex.const.js";
import { focusRing } from "../../focus-ring.stylex.const.js";
// Apple row sources 550:50627 / 550:50515. Heights are minimums for text scaling.
export const listStyles = stylex.create({
  root: {
    listStyleType: "none",
    margin: 0,
    padding: 0,
    color: tokens.labelPrimary,
    fontFamily: tokens.fontBody,
  },
  item: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  tall: { minHeight: 68 },
  content: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    flexGrow: 1,
    minWidth: 0,
    paddingBlock: 8,
  },
  title: { fontSize: 17, lineHeight: "22px", fontWeight: 400, overflowWrap: "anywhere" },
  description: {
    fontSize: 15,
    lineHeight: "20px",
    color: tokens.labelSecondary,
    overflowWrap: "anywhere",
  },
  leading: { display: "inline-flex", alignItems: "center", flexShrink: 0, fontSize: 24 },
  trailing: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    marginInlineStart: "auto",
    color: tokens.labelSecondary,
    fontSize: 17,
    lineHeight: "22px",
    flexShrink: 0,
  },
  separator: {
    listStyleType: "none",
  },
  action: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    width: "100%",
    minHeight: 52,
    padding: 0,
    borderWidth: 0,
    backgroundColor: "transparent",
    color: "inherit",
    font: "inherit",
    textAlign: "start",
    borderRadius: 12,
    cursor: tokens.cursorInteractive,
    outlineStyle: "none",
    boxShadow: { default: "none", ":focus-visible": focusRing.underline },
    opacity: { default: 1, ":disabled": 0.4 },
    ":not(:disabled)": {
      backgroundColor: {
        default: "transparent",
        ":active": tokens.controlHoverFill,
        "@media (hover: hover)": { default: null, ":hover": tokens.controlHoverFill },
      },
    },
  },
});
