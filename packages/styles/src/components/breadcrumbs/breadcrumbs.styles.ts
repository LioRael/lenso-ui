import * as stylex from "@stylexjs/stylex";
import { tokens } from "../../tokens.stylex.const.js";
export const breadcrumbsStyles = stylex.create({
  root: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    margin: 0,
    padding: 0,
    listStyleType: "none",
  },
  item: { display: "flex", flexShrink: 0, alignItems: "center", justifyContent: "center", gap: 4 },
  link: {
    position: "relative",
    fontSize: 14,
    lineHeight: "20px",
    fontWeight: 500,
    color: tokens.muted,
    textDecorationLine: {
      default: "none",
      "@media (hover: hover)": { default: null, ":hover": "underline" },
    },
    opacity: 1,
  },
  current: { color: tokens.link },
  separator: {
    width: 12,
    height: 12,
    color: tokens.muted,
    transform: { default: "none", ":dir(rtl)": "rotate(180deg)" },
  },
  lastSeparator: { display: { default: "inline-flex", ":is(li:last-child > *)": "none" } },
});
