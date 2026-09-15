import * as stylex from "@stylexjs/stylex";

import { tokens } from "../tokens.stylex.js";

export const styles = stylex.create({
  root: {
    alignItems: "center",
    boxSizing: "border-box",
    color: tokens.colorContentSecondary,
    display: "flex",
    flexDirection: "column",
    fontFamily: tokens.fontSans,
    padding: tokens.space6,
    textAlign: "center",
    width: "100%",
  },
  start: {
    alignItems: "flex-start",
    textAlign: "start",
  },
  visual: {
    alignItems: "center",
    color: tokens.colorContentTertiary,
    display: "flex",
    justifyContent: "center",
    marginBottom: tokens.space3,
    minHeight: "32px",
    minWidth: "32px",
  },
  title: {
    color: tokens.colorContentPrimary,
    fontFamily: tokens.fontSans,
    fontSize: "14px",
    fontWeight: 500,
    lineHeight: "20px",
    margin: 0,
    maxWidth: "480px",
  },
  description: {
    color: tokens.colorContentTertiary,
    fontFamily: tokens.fontSans,
    fontSize: "13px",
    lineHeight: "20px",
    marginBlock: tokens.space1 + " 0",
    marginInline: 0,
    maxWidth: "480px",
  },
  actions: {
    alignItems: "center",
    display: "flex",
    flexWrap: "wrap",
    gap: tokens.space2,
    justifyContent: "center",
    marginTop: tokens.space4,
  },
});
