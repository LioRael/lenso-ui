import * as stylex from "@stylexjs/stylex";
import { presentation } from "../../shared/presentation.stylex.const.js";
import { tokens } from "../../tokens.stylex.const.js";
export const drawerStyles = stylex.create({
  content: {
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    minHeight: 0,
    minWidth: 0,
  },
  fixedSection: { flexShrink: 0 },
  backdrop: {
    position: "fixed",
    inset: 0,
    zIndex: tokens.zIndexOverlay,
    backgroundColor: tokens.scrim,
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
    boxSizing: "border-box",
    "--drawer-edge-inset": {
      default: "0px",
      ':has([data-swipe-direction="left"],[data-swipe-direction="right"])': {
        default: "8px",
        "@media (min-width: 640px)": "12px",
      },
    },
    padding: "var(--drawer-edge-inset)",
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
    backgroundColor: presentation.background,
    color: tokens.labelPrimary,
    borderStartStartRadius: {
      default: presentation.radius,
      ':is([data-swipe-direction="up"])': 0,
    },
    borderStartEndRadius: {
      default: presentation.radius,
      ':is([data-swipe-direction="up"])': 0,
    },
    borderEndStartRadius: {
      default: 0,
      ':is([data-swipe-direction="up"],[data-swipe-direction="left"],[data-swipe-direction="right"])':
        presentation.radius,
    },
    borderEndEndRadius: {
      default: 0,
      ':is([data-swipe-direction="up"],[data-swipe-direction="left"],[data-swipe-direction="right"])':
        presentation.radius,
    },
    boxShadow: presentation.shadow,
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
        "translateX(calc(-100% - var(--drawer-edge-inset, 0px)))",
      ':is([data-starting-style],[data-ending-style])[data-swipe-direction="right"]':
        "translateX(calc(100% + var(--drawer-edge-inset, 0px)))",
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
    borderRadius: tokens.shapeContentXs,
    backgroundColor: tokens.separator,
  },
});
