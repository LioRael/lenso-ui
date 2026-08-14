import * as stylex from "@stylexjs/stylex";

import { tokens } from "../tokens.stylex.js";

export const quickLinkState = stylex.defineVars({ trailingOpacity: "0" });

export const styles = stylex.create({
  root: {
    [quickLinkState.trailingOpacity]: {
      default: "0",
      ":hover": "1",
      '[data-visual-state="hover"]': "1",
    },
    alignItems: "center",
    backgroundColor: {
      default: "transparent",
      ":hover": tokens.colorSurfaceLevel3,
      '[data-visual-state="hover"]': tokens.colorSurfaceLevel3,
    },
    borderStyle: "none",
    borderWidth: 0,
    borderRadius: tokens.radiusRounded,
    boxSizing: "border-box",
    color: {
      default: tokens.colorContentSecondary,
      ":hover": tokens.colorContentPrimary,
      '[data-visual-state="hover"]': tokens.colorContentPrimary,
    },
    cursor: { default: "pointer", ":disabled": "default" },
    display: "inline-flex",
    fontFamily: tokens.fontSans,
    fontSize: "13px",
    fontWeight: 500,
    gap: "4px",
    height: "28px",
    justifyContent: "center",
    lineHeight: "18px",
    opacity: { default: 1, ":disabled": tokens.opacityDisabled },
    outline: { default: "none", ":focus-visible": `1px solid ${tokens.colorFocusRing}` },
    outlineOffset: "1px",
    paddingBlock: "5px",
    paddingInline: "6px 8px",
    textDecoration: "none",
    transitionDuration: "120ms",
    transitionProperty: "background-color, color",
    transitionTimingFunction: "ease-out",
    whiteSpace: "nowrap",
  },
  leading: {
    alignItems: "center",
    display: "inline-flex",
    flexShrink: 0,
    height: "16px",
    justifyContent: "center",
    width: "16px",
  },
  label: { flexShrink: 0 },
  trailing: {
    alignItems: "center",
    display: "inline-flex",
    flexShrink: 0,
    height: "14px",
    justifyContent: "center",
    opacity: quickLinkState.trailingOpacity,
    transitionDuration: "120ms",
    transitionProperty: "opacity",
    width: "14px",
  },
});
