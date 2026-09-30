import * as stylex from "@stylexjs/stylex";
import { tokens } from "../../tokens.stylex.const.js";
export const accordionStyles = stylex.create({
  root: { width: "100%", contain: "layout style" },
  surface: { backgroundColor: tokens.surface, borderRadius: `min(32px, ${tokens.radius3xl})` },
  item: {
    position: "relative",
    borderWidth: 0,
    "::after": {
      content: { default: '""', ":last-child": "none" },
      position: "absolute",
      insetInlineStart: 0,
      bottom: 0,
      height: 1,
      width: "100%",
      borderRadius: 2,
      backgroundColor: tokens.separator,
      pointerEvents: "none",
    },
  },
  surfaceItem: {
    "::after": {
      insetInlineStart: "3%",
      width: "94%",
      backgroundColor: `color-mix(in srgb, ${tokens.surfaceForeground} 6%, transparent)`,
    },
  },
  hideSeparator: { "::after": { display: "none" } },
  heading: { display: "flex", margin: 0 },
  trigger: {
    display: "flex",
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    textAlign: "start",
    fontSize: 14,
    lineHeight: "20px",
    fontWeight: 500,
    fontFamily: tokens.fontSans,
    borderWidth: 0,
    backgroundColor: {
      default: "transparent",
      "@media (hover: hover)": {
        default: null,
        ':hover:not([aria-expanded="true"])': `color-mix(in oklab, ${tokens.foreground} 3%, transparent 90%)`,
      },
    },
    color: "inherit",
    cursor: {
      default: tokens.cursorInteractive,
      ":disabled": tokens.cursorDisabled,
      ':is([aria-disabled="true"])': tokens.cursorDisabled,
    },
    pointerEvents: { default: "auto", ":disabled": "none", ':is([aria-disabled="true"])': "none" },
    WebkitTapHighlightColor: "transparent",
    transitionProperty: "opacity, box-shadow",
    transitionDuration: { default: "150ms", "@media (prefers-reduced-motion: reduce)": "0ms" },
    transitionTimingFunction: "ease-out",
    outlineStyle: "none",
    boxShadow: {
      default: "none",
      ":focus-visible": `0 0 0 2px ${tokens.background}, 0 0 0 4px ${tokens.focus}`,
    },
    opacity: {
      default: 1,
      ":disabled": tokens.disabledOpacity,
      ':is([aria-disabled="true"])': tokens.disabledOpacity,
    },
  },
  surfaceTrigger: {
    backgroundColor: {
      default: "transparent",
      "@media (hover: hover)": {
        default: null,
        ':hover:not([aria-expanded="true"])': tokens.default,
      },
    },
    borderStartStartRadius: {
      default: 0,
      ':is([data-slot="accordion-item"]:first-child *)': `min(32px, ${tokens.radius3xl})`,
    },
    borderStartEndRadius: {
      default: 0,
      ':is([data-slot="accordion-item"]:first-child *)': `min(32px, ${tokens.radius3xl})`,
    },
    borderEndStartRadius: {
      default: 0,
      ':is([data-slot="accordion-item"]:last-child *):not([aria-expanded="true"])': `min(32px, ${tokens.radius3xl})`,
    },
    borderEndEndRadius: {
      default: 0,
      ':is([data-slot="accordion-item"]:last-child *):not([aria-expanded="true"])': `min(32px, ${tokens.radius3xl})`,
    },
  },
  indicator: {
    marginInlineStart: "auto",
    width: 16,
    height: 16,
    flexShrink: 0,
    color: tokens.muted,
    transform: { default: "rotate(0deg)", ":is([data-panel-open] *)": "rotate(-180deg)" },
    transitionProperty: "transform",
    transitionDuration: { default: "250ms", "@media (prefers-reduced-motion: reduce)": "0ms" },
    transitionTimingFunction: tokens.easeSmooth,
  },
  panel: {
    height: {
      default: "var(--accordion-panel-height)",
      ":is([data-starting-style])": 0,
      ":is([data-ending-style])": 0,
    },
    opacity: { default: 1, ":is([data-starting-style])": 0, ":is([data-ending-style])": 0 },
    overflow: "clip",
    willChange: { default: "auto", ":is([data-open])": "height, opacity" },
    transitionProperty: "height, opacity",
    transitionDuration: { default: "200ms", "@media (prefers-reduced-motion: reduce)": "0ms" },
    transitionTimingFunction: "cubic-bezier(0.25, 0.46, 0.45, 0.94), ease-out",
  },
  body: {
    paddingInline: 16,
    paddingTop: 0,
    paddingBottom: 16,
    color: tokens.muted,
    fontSize: 14,
    lineHeight: "20px",
  },
});
