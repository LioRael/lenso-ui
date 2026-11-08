import * as stylex from "@stylexjs/stylex";
import { presentation } from "../../shared/presentation.stylex.const.js";
import { tokens } from "../../tokens.stylex.const.js";

// Geometry adapts the supplied sheet reference for the web.
export const sheetStyles = stylex.create({
  backdrop: {
    position: "fixed",
    inset: 0,
    zIndex: tokens.zIndexOverlay,
    backgroundColor: "rgb(0 0 0 / .2)",
    opacity: {
      default: 1,
      ":is([data-starting-style], [data-ending-style])": 0,
    },
    transitionProperty: "opacity",
    transitionDuration: {
      default: "250ms",
      ":is([data-swiping])": "0ms",
      "@media (prefers-reduced-motion: reduce)": "0ms",
    },
  },
  undimmed: { backgroundColor: "transparent" },
  viewport: {
    position: "fixed",
    inset: 0,
    zIndex: tokens.zIndexOverlay,
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "center",
    height: "var(--visual-viewport-height, 100dvh)",
    overflow: "clip",
  },
  popup: {
    "--lenso-sheet-position": {
      default: "calc(var(--drawer-snap-point-offset, 0px) + var(--drawer-swipe-movement-y, 0px))",
      ":is([data-starting-style], [data-ending-style])": "var(--sheet-popup-height, 100dvh)",
    },
    "--sheet-shared-position": {
      default: "initial",
      ":is([data-sheet-clock]:not([data-sheet-entering], [data-ending-style]))":
        "var(--lenso-sheet-position)",
    },
    "--sheet-snap-offset": "var(--drawer-snap-point-offset, 0px)",
    "--sheet-nesting-offset": { default: "0px", ":is([data-sheet-nested])": "10px" },
    position: "relative",
    boxSizing: "border-box",
    width: { default: "100%", "@media (min-width: 768px)": "min(936px, calc(100% - 48px))" },
    height: {
      default: "calc(100% - 62px)",
      "@media (min-width: 768px)": "min(852px, calc(100% - 48px))",
    },
    marginBottom: { default: 0, "@media (min-width: 768px)": 24 },
    minHeight: 0,
    outline: "none",
    transform: {
      default:
        "translateY(calc(var(--drawer-swipe-movement-y, 0px) + var(--drawer-snap-point-offset, 0px) + var(--sheet-nesting-offset, 0px)))",
      ":is([data-starting-style], [data-ending-style])": "translateY(100%)",
      ":is([data-sheet-clock])":
        "translateY(calc(var(--lenso-sheet-position) + var(--sheet-nesting-offset, 0px)))",
      ":is([data-sheet-clock][data-starting-style], [data-sheet-clock][data-ending-style])":
        "translateY(var(--lenso-sheet-position))",
    },
    transitionProperty: {
      default: "transform",
      ":is([data-sheet-clock])": "--lenso-sheet-position",
    },
    transitionDuration: {
      default: "calc(var(--sheet-motion-duration, 250ms) * var(--drawer-swipe-strength, 1))",
      ":is([data-ending-style])": "calc(200ms * var(--drawer-swipe-strength, 1))",
      ":is([data-swiping])": "0ms",
      "@media (prefers-reduced-motion: reduce)": "0ms",
    },
    transitionTimingFunction: tokens.motionEaseOutFluid,
  },
  adaptivePopup: {
    "--sheet-motion-duration": "500ms",
  },
  surface: {
    // A filtered button inside a translucent fixed sheet cannot sample its
    // backdrop in Chromium. Use the shared Small Glass blur/paint fallback.
    "--lenso-glass-button-filter": {
      default: "saturate(1)",
      ":is([data-expanded] > *)": "initial",
      "@media (min-width: 768px)": "initial",
    },
    "--lenso-glass-button-fallback-paint": {
      default: "1",
      ":is([data-expanded] > *)": "initial",
      "@media (min-width: 768px)": "initial",
    },
    "--lenso-glass-button-fallback-background": {
      default: "rgb(255 255 255 / .94)",
      ":is([data-expanded] > *)": "initial",
      "@media (min-width: 768px)": "initial",
    },
    "--sheet-solid-background": {
      default: "var(--sheet-base-solid-background)",
      ':is([data-level="elevated"] *)': tokens.backgroundPrimary,
    },
    position: "relative",
    isolation: "isolate",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    width: {
      default: "calc(100% - var(--sheet-edge-inset, 6px) * 2)",
      ":is([data-expanded] > *)": "calc(100% - var(--sheet-edge-inset, 0px) * 2)",
      ":is([data-nested-drawer-open] > *)": "92%",
      "@media (min-width: 768px)": "100%",
    },
    height: {
      default:
        "var(--sheet-visible-height, calc(100% - var(--sheet-snap-offset, 0px) - var(--sheet-nesting-offset, 0px) - 6px))",
      ":is([data-expanded] > *)":
        "var(--sheet-visible-height, calc(100% - var(--sheet-nesting-offset, 0px)))",
    },
    marginInline: "auto",
    minHeight: 0,
    borderRadius: {
      default: "38px 38px var(--sheet-bottom-radius, 58px) var(--sheet-bottom-radius, 58px)",
      ":is([data-expanded] > *)":
        "38px 38px var(--sheet-bottom-radius, 0px) var(--sheet-bottom-radius, 0px)",
      "@media (min-width: 768px)": presentation.radius,
    },
    backgroundColor: {
      default: "transparent",
      ":is([data-material-opaque])": "var(--sheet-solid-background)",
      ":is([data-expanded] > *)": "var(--sheet-adaptive-background, var(--sheet-solid-background))",
      "@media (min-width: 768px)": "var(--sheet-solid-background)",
    },
    color: tokens.labelPrimary,
    backdropFilter: {
      default:
        "blur(var(--lenso-glass-medium-blur, 15.3px)) var(--sheet-glass-filter, saturate(1))",
      ":is([data-expanded] > *)": "var(--sheet-adaptive-filter, none)",
      ":is([data-material-opaque])": "none",
      "@media (min-width: 768px)": "none",
    },
    boxShadow: {
      default: "var(--sheet-adaptive-shadow, none)",
      ":is([data-expanded] > *)": "var(--sheet-adaptive-shadow, 0 15px 75px rgb(0 0 0 / .18))",
      "@media (min-width: 768px)": presentation.shadow,
    },
    transitionProperty: "width, height, border-radius",
    transitionDuration: {
      default: "250ms",
      ":is([data-sheet-adaptive] > *)": "0ms",
      ":is([data-swiping] > *)": "0ms",
      "@media (prefers-reduced-motion: reduce)": "0ms",
    },
    transitionTimingFunction: "cubic-bezier(.32,.72,0,1)",
  },
  glass: {
    backdropFilter: "none",
    position: "absolute",
    inset: 0,
    zIndex: -1,
    pointerEvents: "none",
    borderRadius: "inherit",
    display: {
      default: "block",
      ":is([data-expanded] > * > *)": "var(--sheet-glass-display, none)",
      "@media (min-width: 768px)": "none",
    },
  },
  solid: {
    position: "absolute",
    inset: 0,
    zIndex: -1,
    pointerEvents: "none",
    borderRadius: "inherit",
    backgroundColor: "var(--sheet-solid-background)",
    display: {
      default: "var(--sheet-solid-display, none)",
      "@media (min-width: 768px)": "none",
    },
    opacity: "var(--sheet-solid-opacity, 0)",
    transitionProperty: "opacity",
    transitionDuration: {
      default: "250ms",
      ":is([data-sheet-adaptive] > * > *)": "0ms",
      ":is([data-swiping] > * > *)": "0ms",
      "@media (prefers-reduced-motion: reduce)": "0ms",
    },
    transitionTimingFunction: "cubic-bezier(.32,.72,0,1)",
  },
  handle: {
    position: "absolute",
    top: 0,
    insetInline: 0,
    height: 10,
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-end",
    pointerEvents: "none",
  },
  handleBar: {
    width: 60,
    height: 4,
    borderRadius: 100,
  },
  header: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexShrink: 0,
    minHeight: { default: 70, "@media (min-width: 768px)": 64 },
    paddingInline: { default: 16, "@media (min-width: 768px)": 10 },
    paddingBlockStart: { default: 16, "@media (min-width: 768px)": 10 },
    paddingBlockEnd: 10,
    boxSizing: "border-box",
  },
  title: {
    position: "absolute",
    insetInline: { default: 68, "@media (min-width: 768px)": 62 },
    margin: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    textAlign: "center",
    fontSize: 15,
    lineHeight: "20px",
    fontWeight: 600,
    pointerEvents: "none",
  },
  close: {
    width: 44,
    height: 44,
  },
  body: {
    minHeight: 0,
    flexGrow: 1,
    overflowY: "auto",
    overscrollBehavior: "contain",
    padding: "16px 20px max(32px, env(safe-area-inset-bottom))",
    color: tokens.labelPrimary,
  },
  footer: {
    flexShrink: 0,
    padding: "12px 20px max(12px, env(safe-area-inset-bottom))",
  },
});
