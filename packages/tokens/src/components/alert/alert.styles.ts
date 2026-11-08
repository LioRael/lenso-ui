// modified for StyleX.
import * as stylex from "@stylexjs/stylex";
import { tokens } from "../../tokens.stylex.const.js";
export const alertStyles = stylex.create({
  root: {
    display: "flex",
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    gap: 16,
    backgroundColor: "transparent",
    paddingInline: 16,
    paddingBlock: 12,
    borderRadius: tokens.shapeContent,
  },
  content: {
    display: "flex",
    height: "100%",
    flexGrow: 1,
    flexDirection: "column",
    alignItems: "flex-start",
  },
  indicator: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 4,
    userSelect: "none",
  },
  icon: { width: 16, height: 16, boxSizing: "content-box" },
  title: { fontSize: 14, lineHeight: "24px", fontWeight: 500 },
  description: { fontSize: 14, lineHeight: "20px", color: tokens.labelSecondary },
});
export const alertColors = stylex.create({
  default: { color: tokens.labelPrimary },
  accent: { color: tokens.tintText },
  success: { color: tokens.statusSuccessText },
  warning: { color: tokens.statusWarningText },
  danger: { color: tokens.statusErrorText },
});
