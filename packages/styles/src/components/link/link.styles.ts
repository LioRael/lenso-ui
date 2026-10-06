import * as stylex from "@stylexjs/stylex";
import { focusRing } from "../../focus-ring.stylex.const.js";
import { tokens } from "../../tokens.stylex.const.js";
export const linkStyles = stylex.create({
  root: {
    position: "relative",
    display: "inline-flex",
    height: "fit-content",
    width: "fit-content",
    alignItems: "center",
    borderRadius: tokens.radiusXl,
    fontWeight: 500,
    color: tokens.link,
    textDecorationLine: {
      default: "none",
      "@media (hover: hover)": { default: null, ":hover": "underline" },
      ":active": "underline",
    },
    textDecorationColor: {
      default: tokens.separatorTertiary,
      "@media (hover: hover)": {
        default: null,
        ":hover": `color-mix(in srgb, ${tokens.muted} 50%, transparent)`,
      },
      ":active": tokens.muted,
    },
    textDecorationThickness: "1.5px",
    textUnderlineOffset: 4,
    cursor: {
      default: tokens.cursorInteractive,
      ':is([aria-disabled="true"])': tokens.cursorDisabled,
    },
    pointerEvents: { default: "auto", ':is([aria-disabled="true"])': "none" },
    WebkitTapHighlightColor: "transparent",
    transitionProperty: "color, background-color, box-shadow, opacity",
    transitionDuration: {
      default: "100ms, 150ms, 150ms, 100ms",
      "@media (prefers-reduced-motion: reduce)": "0ms",
    },
    transitionTimingFunction: tokens.easeSmooth,
    outlineStyle: "none",
    boxShadow: {
      default: "none",
      ":focus-visible": focusRing.outer,
    },
    opacity: { default: 1, ':is([aria-disabled="true"])': tokens.disabledOpacity },
  },
  icon: {
    pointerEvents: "none",
    display: "inline-flex",
    width: "0.75em",
    height: "0.75em",
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    color: "currentColor",
    opacity: {
      default: 0.6,
      ":is(a:hover *)": 1,
      ":is(a:active *)": 1,
      ":is(a:focus-visible *)": 1,
    },
    transitionProperty: "opacity",
    transitionDuration: { default: "150ms", "@media (prefers-reduced-motion: reduce)": "0ms" },
    transitionTimingFunction: "ease-out",
  },
  defaultIcon: { marginInlineStart: 4, paddingBottom: 6 },
});
