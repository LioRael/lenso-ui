// HeroUI v3.2.6 tag.css adaptation, Apache-2.0.
import * as stylex from "@stylexjs/stylex";
import { tokens } from "../../tokens.stylex.const.js";
export const tagStyles = stylex.create({
  cell: { display: "inline-flex", alignItems: "center", gap: "inherit" },
  root: {
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    borderRadius: tokens.radiusXl,
    fontWeight: 500,
    userSelect: "none",
    paddingInline: 8,
    paddingBlock: 4,
    fontSize: 12,
    cursor: tokens.cursorInteractive,
    outline: { default: "none", ":focus-visible": `2px solid ${tokens.focus}` },
    outlineOffset: 2,
    transitionProperty: "color, scale, opacity, background-color, box-shadow",
    transitionDuration: { default: "100ms", "@media (prefers-reduced-motion: reduce)": "0ms" },
    transitionTimingFunction: tokens.easeSmooth,
  },
  sm: { paddingBlock: 2 },
  md: { paddingBlock: 4 },
  lg: { paddingInline: 10, paddingBlock: 6, fontSize: 14, borderRadius: tokens.radius2xl },
  default: {
    color: tokens.defaultForeground,
    backgroundColor: { default: tokens.default, ":hover": tokens.defaultHover },
  },
  surface: {
    color: tokens.surfaceForeground,
    backgroundColor: { default: tokens.surface, ":hover": tokens.surfaceHover },
  },
  selected: {
    color: tokens.accentSoftForeground,
    backgroundColor: { default: tokens.accentSoft, ":hover": tokens.accentSoftHover },
  },
  disabled: {
    opacity: tokens.disabledOpacity,
    cursor: tokens.cursorDisabled,
    pointerEvents: "none",
  },
  removeButton: {
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 12,
    height: 12,
    padding: 0,
    borderWidth: 0,
    backgroundColor: "transparent",
    color: "inherit",
    cursor: tokens.cursorInteractive,
    "::after": { content: '""', position: "absolute", inset: -6 },
  },
});
