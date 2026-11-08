// Adapted from onlymoein/liquidglass, MIT. Copyright (c) 2026 Kelvin Zhang and Moein Saharkhiz.
// Modified for Lenso semantic tokens, StyleX and logical direction.
import * as stylex from "@stylexjs/stylex";
import { tokens } from "../../tokens.stylex.const.js";

export const navigationBarStyles = stylex.create({
  root: {
    position: "sticky",
    top: 0,
    zIndex: 1,
    width: "100%",
    boxSizing: "border-box",
    minHeight: 60,
    borderRadius: 0,
    paddingBlock: 8,
    paddingInline: 16,
    gridTemplateColumns: "minmax(max-content, 1fr) minmax(0, auto) minmax(max-content, 1fr)",
    fontFamily: tokens.fontBody,
  },
  side: { display: "flex", alignItems: "center", gap: 8, minWidth: 0 },
  trailing: { justifyContent: "flex-end" },
  title: {
    minWidth: 0,
    margin: 0,
    overflow: "hidden",
    color: tokens.labelPrimary,
    fontSize: 17,
    fontWeight: 600,
    lineHeight: "22px",
    textAlign: "center",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  collapsingTitle: {
    opacity: { default: 0, ":is([data-collapsed] *)": 1 },
    transitionProperty: "opacity",
    transitionDuration: { default: "200ms", "@media (prefers-reduced-motion: reduce)": "0ms" },
  },
  largeTitle: {
    margin: 0,
    paddingInline: 16,
    paddingBlockEnd: 8,
    color: tokens.labelPrimary,
    fontFamily: tokens.fontBody,
    fontSize: 34,
    fontWeight: 700,
    lineHeight: "41px",
    overflowWrap: "anywhere",
  },
  backIcon: { width: 20, height: 20 },
  backIconRtl: { transform: "scaleX(-1)" },
});
