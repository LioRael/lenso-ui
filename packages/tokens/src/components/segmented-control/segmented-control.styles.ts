import * as stylex from "@stylexjs/stylex";
import { tokens } from "../../tokens.stylex.const.js";

export const segmentedControlStyles = stylex.create({
  empty: {
    position: "relative",
    zIndex: 1,
    paddingBlock: 10,
    paddingInline: 12,
    fontSize: "0.8125rem",
    color: tokens.labelSecondary,
  },
  root: {
    maxWidth: "100%",
    minWidth: 0,
  },
  item: {
    flexShrink: 1,
    minWidth: 44,
    boxSizing: "border-box",
  },
  face: {
    display: "block",
    maxWidth: "100%",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
});
