import * as stylex from "@stylexjs/stylex";
import { tokens } from "../../tokens.stylex.const.js";
export const paginationStyles = stylex.create({
  root: {
    display: "flex",
    width: "100%",
    flexDirection: { default: "column", "@media (min-width: 640px)": "row" },
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  summary: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    alignSelf: { default: "start", "@media (min-width: 640px)": "center" },
    fontSize: 14,
    lineHeight: "20px",
    color: tokens.muted,
  },
  content: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    alignSelf: { default: "start", "@media (min-width: 640px)": "center" },
    listStyleType: "none",
    margin: 0,
    padding: 0,
  },
  item: { display: "inline-flex" },
  link: {
    position: "relative",
    isolation: "isolate",
    display: "inline-flex",
    transformOrigin: "center",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: tokens.radius3xl,
    fontWeight: 500,
    whiteSpace: "nowrap",
    outlineStyle: "none",
    userSelect: "none",
    cursor: {
      default: tokens.cursorInteractive,
      ':is([aria-disabled="true"])': tokens.cursorDisabled,
    },
    textDecorationLine: "none",
    WebkitTapHighlightColor: "transparent",
    color: tokens.defaultForeground,
    backgroundColor: {
      default: "transparent",
      "@media (hover: hover)": { default: null, ":hover": tokens.defaultHover },
      ":active": tokens.defaultHover,
    },
    transitionProperty: "transform, background-color, box-shadow",
    transitionDuration: {
      default: "250ms, 100ms, 100ms",
      "@media (prefers-reduced-motion: reduce)": "0ms",
    },
    transitionTimingFunction: tokens.easeSmooth,
    boxShadow: {
      default: "none",
      ":focus-visible": `0 0 0 2px ${tokens.background}, 0 0 0 4px ${tokens.focus}`,
    },
  },
  active: {
    backgroundColor: {
      default: tokens.default,
      "@media (hover: hover)": { default: null, ":hover": tokens.defaultHover },
      ":active": tokens.defaultHover,
    },
  },
  nav: { width: "auto", gap: 6, paddingInline: 10 },
  navSm: { paddingInline: 8 },
  navLg: { paddingInline: 12 },
  ellipsis: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    color: tokens.muted,
    userSelect: "none",
  },
  icon: {
    display: "inline-flex",
    width: 16,
    height: 16,
    pointerEvents: "none",
    transform: { default: "none", ":dir(rtl)": "rotate(180deg)" },
  },
  summarySm: { fontSize: 12, lineHeight: "16px" },
  summaryLg: { fontSize: 16, lineHeight: "24px" },
});
export const paginationSizes = stylex.create({
  sm: {
    width: { default: 32, "@media (min-width: 768px)": 28 },
    height: { default: 32, "@media (min-width: 768px)": 28 },
    fontSize: 12,
    lineHeight: "16px",
  },
  md: {
    width: { default: 36, "@media (min-width: 768px)": 32 },
    height: { default: 36, "@media (min-width: 768px)": 32 },
    fontSize: 14,
    lineHeight: "20px",
  },
  lg: {
    width: { default: 40, "@media (min-width: 768px)": 36 },
    height: { default: 40, "@media (min-width: 768px)": 36 },
    fontSize: 16,
    lineHeight: "24px",
  },
});
export const paginationPress = stylex.create({
  sm: { transform: { default: "none", ":active": "scale(0.98)" } },
  md: { transform: { default: "none", ":active": "scale(0.97)" } },
  lg: { transform: { default: "none", ":active": "scale(0.96)" } },
});
