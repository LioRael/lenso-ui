import * as stylex from "@stylexjs/stylex";

import { tokens } from "../tokens.stylex.js";

export const styles = stylex.create({
  root: {
    alignItems: "flex-start",
    backgroundColor: tokens.colorSurfaceSubtle,
    borderColor: tokens.colorBorderTertiary,
    borderRadius: tokens.radiusControl,
    borderStyle: "solid",
    borderWidth: tokens.sizeBorderControl,
    boxSizing: "border-box",
    display: "flex",
    fontFamily: tokens.fontSans,
    gap: tokens.space2,
    paddingBlock: tokens.space2,
    paddingInline: "10px",
    width: "100%",
  },
  neutral: {
    color: tokens.colorStatusNeutralContent,
  },
  info: {
    color: tokens.colorStatusInfoContent,
  },
  success: {
    color: tokens.colorStatusSuccessContent,
  },
  warning: {
    color: tokens.colorStatusWarningContent,
  },
  error: {
    color: tokens.colorStatusErrorContent,
  },
  icon: {
    alignItems: "center",
    display: "inline-flex",
    flex: "0 0 14px",
    height: "18px",
    justifyContent: "center",
  },
  content: {
    display: "flex",
    flex: 1,
    flexDirection: "column",
    gap: "1px",
    minWidth: 0,
  },
  title: {
    color: tokens.colorContentPrimary,
    fontFamily: tokens.fontSans,
    fontSize: "13px",
    fontWeight: 500,
    lineHeight: "18px",
    margin: 0,
  },
  description: {
    color: tokens.colorContentSecondary,
    fontFamily: tokens.fontSans,
    fontSize: "12px",
    lineHeight: "17px",
    margin: 0,
  },
  actions: {
    alignItems: "center",
    alignSelf: "center",
    display: "flex",
    flexShrink: 0,
    gap: tokens.space2,
    marginInlineStart: tokens.space2,
  },
});
