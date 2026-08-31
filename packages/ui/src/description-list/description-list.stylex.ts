import * as stylex from "@stylexjs/stylex";

import { tokens } from "../tokens.stylex.js";

export const styles = stylex.create({
  root: {
    display: "grid",
    fontFamily: tokens.fontSans,
    margin: 0,
    width: "100%",
  },
  item: {
    borderBottomColor: tokens.colorBorderTertiary,
    borderBottomStyle: "solid",
    borderBottomWidth: tokens.sizeBorderControl,
    display: "grid",
    gap: tokens.space4,
    gridTemplateColumns: "minmax(120px, 1fr) minmax(0, 2fr)",
    paddingBlock: tokens.space2,
    ":last-child": { borderBottomWidth: 0 },
  },
  stackedItem: {
    gap: tokens.space1,
    gridTemplateColumns: "minmax(0, 1fr)",
  },
  term: {
    color: tokens.colorContentTertiary,
    fontSize: "12px",
    fontWeight: 500,
    lineHeight: "18px",
    margin: 0,
    minWidth: 0,
  },
  description: {
    color: tokens.colorContentSecondary,
    fontSize: "13px",
    lineHeight: "18px",
    margin: 0,
    minWidth: 0,
    overflowWrap: "anywhere",
  },
});
