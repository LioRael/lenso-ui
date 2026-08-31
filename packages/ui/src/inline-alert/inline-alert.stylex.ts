import * as stylex from "@stylexjs/stylex";

import { tokens } from "../tokens.stylex.js";

export const styles = stylex.create({
  root: {
    alignItems: "flex-start",
    backgroundColor: tokens.colorSurfaceSubtle,
    borderRadius: tokens.radiusControl,
    borderStyle: "solid",
    borderWidth: tokens.sizeBorderControl,
    borderLeftWidth: "2px",
    boxSizing: "border-box",
    display: "flex",
    fontFamily: tokens.fontSans,
    gap: tokens.space2,
    padding: tokens.space3,
    width: "100%",
  },
  neutral: {
    borderColor: tokens.colorBorderSecondary,
    color: tokens.colorStatusNeutralContent,
  },
  info: {
    borderColor: tokens.colorStatusInfoContent,
    color: tokens.colorStatusInfoContent,
  },
  success: {
    borderColor: tokens.colorStatusSuccessContent,
    color: tokens.colorStatusSuccessContent,
  },
  warning: {
    borderColor: tokens.colorStatusWarningContent,
    color: tokens.colorStatusWarningContent,
  },
  error: {
    backgroundColor: tokens.colorStatusErrorSurface,
    borderColor: tokens.colorStatusErrorBorder,
    color: tokens.colorStatusErrorContent,
  },
  icon: {
    alignItems: "center",
    display: "inline-flex",
    flex: "0 0 16px",
    height: "20px",
    justifyContent: "center",
  },
  content: {
    display: "flex",
    flex: 1,
    flexDirection: "column",
    minWidth: 0,
  },
  title: {
    color: tokens.colorContentPrimary,
    fontFamily: tokens.fontSans,
    fontSize: "13px",
    fontWeight: 500,
    lineHeight: "20px",
    margin: 0,
  },
  description: {
    color: tokens.colorContentSecondary,
    fontFamily: tokens.fontSans,
    fontSize: "12px",
    lineHeight: "18px",
    margin: 0,
  },
  actions: {
    alignItems: "center",
    alignSelf: "center",
    display: "flex",
    flexShrink: 0,
    gap: tokens.space2,
    marginLeft: tokens.space2,
  },
});
