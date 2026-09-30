// Adapted from HeroUI v3.2.6 (e385ac2), Apache-2.0.
import * as stylex from "@stylexjs/stylex";
import { tokens } from "../../tokens.stylex.const.js";
export const drawerStyles = stylex.create({
  backdrop: {
    position: "fixed",
    inset: 0,
    zIndex: tokens.zIndexOverlay,
    backgroundColor: tokens.backdrop,
    opacity: {
      default: "calc(1 - var(--drawer-swipe-progress, 0))",
      ":is([data-starting-style],[data-ending-style])": 0,
    },
    transitionProperty: "opacity",
    transitionDuration: {
      default: "250ms",
      ":is([data-ending-style])": "200ms",
      ":is([data-swiping])": "0ms",
      "@media (prefers-reduced-motion: reduce)": "0ms",
    },
    transitionTimingFunction: "cubic-bezier(.32,.72,0,1)",
  },
  viewport: {
    position: "fixed",
    inset: 0,
    zIndex: tokens.zIndexOverlay,
    display: "flex",
    height: "var(--visual-viewport-height, 100dvh)",
    alignItems: { default: "flex-end", ':has([data-swipe-direction="up"])': "flex-start" },
    justifyContent: {
      default: "center",
      ':has([data-swipe-direction="left"])': "flex-start",
      ':has([data-swipe-direction="right"])': "flex-end",
    },
  },
  popup: {
    boxSizing: "border-box",
    position: "relative",
    display: "flex",
    flexDirection: "column",
    padding: 24,
    width: {
      default: "100%",
      ':is([data-swipe-direction="left"],[data-swipe-direction="right"])': {
        default: "min(320px, 85vw)",
        "@media (min-width: 640px)": "min(384px, 85vw)",
      },
    },
    maxHeight: {
      default: "85dvh",
      ':is([data-swipe-direction="left"],[data-swipe-direction="right"])': "100%",
    },
    height: {
      default: "auto",
      ':is([data-swipe-direction="left"],[data-swipe-direction="right"])': "100%",
    },
    backgroundColor: tokens.overlay,
    color: tokens.overlayForeground,
    borderStartStartRadius: {
      default: "min(32px, var(--radius-2xl))",
      ':is([data-swipe-direction="up"],[data-swipe-direction="left"],[data-swipe-direction="right"])': 0,
    },
    borderStartEndRadius: {
      default: "min(32px, var(--radius-2xl))",
      ':is([data-swipe-direction="up"],[data-swipe-direction="left"],[data-swipe-direction="right"])': 0,
    },
    borderEndStartRadius: {
      default: 0,
      ':is([data-swipe-direction="up"])': "min(32px, var(--radius-2xl))",
    },
    borderEndEndRadius: {
      default: 0,
      ':is([data-swipe-direction="up"])': "min(32px, var(--radius-2xl))",
    },
    boxShadow: tokens.shadowOverlay,
    outline: "none",
    minHeight: 0,
    overflow: "clip",
    overscrollBehavior: "contain",
    transform: {
      default:
        "translate(var(--drawer-swipe-movement-x, 0px), calc(var(--drawer-swipe-movement-y, 0px) + var(--drawer-snap-point-offset, 0px)))",
      ":is([data-starting-style],[data-ending-style])": "translateY(100%)",
      ':is([data-starting-style],[data-ending-style])[data-swipe-direction="up"]':
        "translateY(-100%)",
      ':is([data-starting-style],[data-ending-style])[data-swipe-direction="left"]':
        "translateX(-100%)",
      ':is([data-starting-style],[data-ending-style])[data-swipe-direction="right"]':
        "translateX(100%)",
    },
    transitionProperty: "transform",
    transitionDuration: {
      default: "calc(250ms * var(--drawer-swipe-strength, 1))",
      ":is([data-ending-style])": "calc(200ms * var(--drawer-swipe-strength, 1))",
      ":is([data-swiping])": "0ms",
      "@media (prefers-reduced-motion: reduce)": "0ms",
    },
    transitionTimingFunction: "cubic-bezier(.32,.72,0,1)",
  },
  handle: { display: "flex", alignItems: "center", justifyContent: "center", paddingBottom: 8 },
  handleBar: {
    width: 36,
    height: 4,
    borderRadius: tokens.radiusXs,
    backgroundColor: tokens.separator,
  },
});
