// Adapted from HeroUI v3.2.6 (e385ac2), Apache-2.0.
import * as stylex from "@stylexjs/stylex";
import { tokens } from "../../tokens.stylex.const.js";

export const menuItemStyles = stylex.create({
  root: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    gap: 12,
    minHeight: 36,
    width: "100%",
    paddingInlineEnd: 8,
    paddingBlock: 6,
    borderRadius: tokens.radius2xl,
    outline: "none",
    cursor: tokens.cursorInteractive,
    backgroundColor: { default: "transparent", ":is([data-highlighted])": tokens.default },
    opacity: { default: 1, ":is([data-disabled])": tokens.disabledOpacity },
    transform: { default: "scale(1)", ":active": "scale(.98)" },
    transitionProperty: "transform, box-shadow",
    transitionDuration: {
      default: "250ms, 150ms",
      "@media (prefers-reduced-motion: reduce)": "0ms",
    },
    transitionTimingFunction: tokens.easeOutQuart,
    fontSize: 14,
    WebkitTapHighlightColor: "transparent",
    paddingInlineStart: { default: 8, ":has([data-slot='menu-item-indicator'])": 28 },
  },
  danger: { color: tokens.danger, "--menu-item-indicator-color": tokens.danger },
  indicator: {
    position: "absolute",
    insetInlineStart: 8,
    top: "50%",
    transform: "translateY(-50%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 16,
    height: 16,
    color: "var(--menu-item-indicator-color, var(--muted))",
  },
  submenuIndicator: { marginInlineStart: "auto", color: tokens.muted, fontSize: 12 },
  label: { width: "fit-content", pointerEvents: "none", userSelect: "none" },
  description: { color: tokens.muted, textWrap: "wrap", pointerEvents: "none", userSelect: "none" },
});
