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
  },
  viewport: {
    boxSizing: "border-box",
    "--drawer-edge-inset": {
      default: "0px",
      ':has([data-side="left"],[data-side="right"])': {
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
    alignItems: { default: "flex-end", ':has([data-side="top"])': "flex-start" },
    justifyContent: {
      default: "center",
      ':has([data-side="left"])': "flex-start",
      ':has([data-side="right"])': "flex-end",
    },
  },
  nativeContent: {
    visibility: {
      default: null,
      ":is([popover]:not(:popover-open),[data-closed]:not([data-ending-style]))": "hidden",
    },
    zIndex: tokens.zIndexOverlay,
    "--drawer-edge-inset": {
      default: "0px",
      ':is([data-side="left"],[data-side="right"])': {
        default: "8px",
        "@media (min-width: 640px)": "12px",
      },
    },
    marginBlock: "var(--drawer-edge-inset)",
    marginInlineStart: { default: null, ':is([data-side="left"])': "var(--drawer-edge-inset)" },
    marginInlineEnd: { default: null, ':is([data-side="right"])': "var(--drawer-edge-inset)" },
    width: {
      default: "100%",
      ':is([data-side="left"],[data-side="right"])': {
        default: "min(320px,85vw)",
        "@media (min-width: 640px)": "min(384px,85vw)",
      },
    },
    height: {
      default: "auto",
      ':is([data-side="left"],[data-side="right"])': "calc(100dvh - var(--drawer-edge-inset) * 2)",
    },
  },
  popup: {
    borderWidth: 0,
    boxSizing: "border-box",
    position: "relative",
    display: "flex",
    flexDirection: "column",
    padding: 24,
    width: {
      default: "100%",
      ':is([data-side="left"],[data-side="right"])': {
        default: "min(320px, 85vw)",
        "@media (min-width: 640px)": "min(384px, 85vw)",
      },
    },
    maxHeight: {
      default: "85dvh",
      ':is([data-side="left"],[data-side="right"])': "100%",
    },
    height: {
      default: "auto",
      ':is([data-side="left"],[data-side="right"])': "100%",
    },
    backgroundColor: presentation.background,
    color: tokens.labelPrimary,
    borderStartStartRadius: {
      default: presentation.radius,
      ':is([data-side="top"])': 0,
    },
    borderStartEndRadius: {
      default: presentation.radius,
      ':is([data-side="top"])': 0,
    },
    borderEndStartRadius: {
      default: 0,
      ':is([data-side="top"],[data-side="left"],[data-side="right"])': presentation.radius,
    },
    borderEndEndRadius: {
      default: 0,
      ':is([data-side="top"],[data-side="left"],[data-side="right"])': presentation.radius,
    },
    boxShadow: presentation.shadow,
    outline: "none",
    minHeight: 0,
    overflow: "clip",
    overscrollBehavior: "contain",
  },
  handle: { display: "flex", alignItems: "center", justifyContent: "center", paddingBottom: 8 },
  handleBar: {
    width: 36,
    height: 4,
    borderRadius: tokens.shapeContentXs,
    backgroundColor: tokens.separator,
  },
});
