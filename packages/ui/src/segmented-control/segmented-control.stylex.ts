import * as stylex from "@stylexjs/stylex";

import { tokens } from "../tokens.stylex.js";

const selectedShadow = `inset 0 0 0 0.5px ${tokens.colorBorderControl}, 0 ${tokens.elevationControlDetailY} ${tokens.elevationControlDetailBlur} ${tokens.elevationControlDetail}`;

export const styles = stylex.create({
  root: {
    alignItems: "center",
    backgroundColor: tokens.colorSurfaceSubtle,
    borderRadius: tokens.radiusRounded,
    boxShadow: `inset 0 0 0 0.5px ${tokens.colorBorderTranslucent}`,
    boxSizing: "border-box",
    display: "flex",
    gap: "2px",
    height: tokens.sizeControlCompact,
    padding: "2px",
  },
  fit: { width: "fit-content" },
  fill: { width: "100%" },
  item: {
    alignItems: "center",
    backgroundColor: {
      default: "transparent",
      ":hover": tokens.colorSurfaceInteractiveHover,
      '[data-visual-state="hover"]': tokens.colorSurfaceInteractiveHover,
      "[data-checked]": tokens.colorSurfaceControl,
    },
    borderRadius: tokens.radiusRounded,
    boxShadow: {
      default: "none",
      "[data-checked]": selectedShadow,
      ":has(input:focus-visible)": `inset 0 0 0 1px ${tokens.colorFocusRing}`,
      '[data-visual-state="focus-visible"]': `inset 0 0 0 1px ${tokens.colorFocusRing}`,
    },
    boxSizing: "border-box",
    color: {
      default: tokens.colorContentTertiary,
      ":hover": tokens.colorContentPrimary,
      '[data-visual-state="hover"]': tokens.colorContentPrimary,
      "[data-checked]": tokens.colorContentPrimary,
    },
    cursor: { default: "pointer", "[data-disabled]": "default" },
    display: "inline-flex",
    flex: "0 0 auto",
    fontFamily: tokens.fontButton,
    fontSize: tokens.typeMetadataSize,
    fontWeight: 500,
    gap: "6px",
    height: "24px",
    justifyContent: "center",
    lineHeight: tokens.typeLabelLineHeight,
    minWidth: 0,
    opacity: { default: 1, "[data-disabled]": tokens.opacityDisabled },
    outline: "none",
    paddingInline: "9px",
    transitionDuration: tokens.motionFeedback,
    transitionProperty: "background-color, box-shadow, color, opacity",
    transitionTimingFunction: "ease-out",
    userSelect: "none",
    whiteSpace: "nowrap",
    "@media (prefers-reduced-motion: reduce)": { transitionDuration: "0ms" },
  },
  fillItem: { flex: "1 1 0" },
});
