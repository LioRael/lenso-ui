import * as stylex from "@stylexjs/stylex";

import { tokens } from "../tokens.stylex.js";

export const styles = stylex.create({
  panel: {
    backgroundColor: tokens.colorSurfaceSidebar,
    boxSizing: "border-box",
    color: tokens.colorContentSecondary,
    display: "flex",
    flexDirection: "column",
    height: "100%",
    width: tokens.sizeSidebar,
  },
  header: {
    alignItems: "center",
    display: "flex",
    fontFamily: tokens.fontSans,
    fontSize: "13px",
    fontWeight: 500,
    minHeight: "56px",
    paddingInline: tokens.space3,
  },
  content: {
    display: "flex",
    flex: 1,
    flexDirection: "column",
    gap: tokens.space1,
    overflow: "auto",
    paddingInline: tokens.space3,
  },
  footer: {
    fontFamily: tokens.fontSans,
    fontSize: "13px",
    padding: tokens.space3,
  },
  item: {
    alignItems: "center",
    backgroundColor: {
      default: "transparent",
      ":hover": tokens.colorSidebarItemHover,
    },
    borderStyle: "none",
    borderWidth: 0,
    borderRadius: tokens.radiusControl,
    color: tokens.colorContentSecondary,
    cursor: "pointer",
    display: "flex",
    fontFamily: tokens.fontSans,
    fontSize: "13px",
    fontWeight: 500,
    gap: "6px",
    height: tokens.sizeControlCompact,
    paddingInline: "10px 9px",
    textAlign: "left",
    width: "100%",
  },
  nestedItem: {
    paddingLeft: "6px",
  },
  selectedItem: {
    backgroundColor: tokens.colorSidebarItemActive,
    color: tokens.colorContentPrimary,
  },
  icon: {
    alignItems: "center",
    display: "inline-flex",
    flexShrink: 0,
    height: "16px",
    justifyContent: "center",
    width: "16px",
  },
  label: {
    flex: 1,
    minWidth: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
});
