import * as stylex from "@stylexjs/stylex";
import { tokens } from "../../tokens.stylex.const.js";
export const toolbarStyles = stylex.create({
  sticky: {
    position: "sticky",
    top: 0,
    zIndex: 1,
    width: "100%",
    borderRadius: 0,
    paddingBlock: 8,
    paddingInline: 16,
    justifyContent: "space-between",
  },
  edge: { inset: "0 0 -24px", height: "auto", zIndex: -1 },
  uniformEdge: {
    backgroundColor:
      "color-mix(in srgb, var(--lenso-material-solid, var(--lenso-background-primary)) 72%, transparent)",
    backdropFilter: "blur(18px) saturate(1.6)",
    maskImage: "linear-gradient(#000 calc(100% - 24px), transparent)",
    ":is([data-contrast='increased'] *)": {
      backdropFilter: "none",
      backgroundColor: "var(--lenso-background-primary)",
    },
    "@media (prefers-contrast: more), (prefers-reduced-transparency: reduce), (forced-colors: active)":
      { backdropFilter: "none", backgroundColor: "Canvas" },
  },
  root: {
    position: "relative",
    isolation: "isolate",
    borderRadius: 1000,
    display: "grid",
    width: "fit-content",
    gridAutoFlow: "column",
    alignItems: "center",
    gap: 8,
  },
  vertical: {
    gridAutoFlow: "row",
    alignItems: "start",
    justifyContent: "start",
    justifyItems: "center",
  },
  attached: { padding: 4, gap: 0 },
  motion: {
    scale: "var(--toolbar-press-scale, 1 1)",
    translate: "var(--toolbar-press-translate, 0px 0px)",
  },
  surfaceChild: {
    scale: "none",
    translate: "none",
    "--lenso-glass-interaction-fill": "transparent",
  },
  groupVertical: { flexDirection: "column" },
  attachedGroup: { padding: 0 },
  verticalButton: { paddingInline: 4 },
  group: {
    position: "relative",
    isolation: "isolate",
    display: "inline-flex",
    alignItems: "center",
    padding: 4,
    gap: 0,
    borderRadius: 1000,
  },
  detachableGroup: {
    padding: 12,
    gap: 40,
  },
  detachableSize: (height: number) => ({
    "--toolbar-group-button-height": `${height}px`,
    "--toolbar-detachable-radius": `${height / 2}px`,
  }),
  detachableButton: {
    transform: {
      default: "translateX(var(--toolbar-joined-offset, 0px))",
      ":dir(rtl)": "translateX(calc(-1 * var(--toolbar-joined-offset, 0px)))",
      ':is([data-toolbar-direction="vertical"] > [data-toolbar-item])':
        "translateY(var(--toolbar-joined-offset, 0px))",
      ':is([data-toolbar-detached="true"] > [data-toolbar-item])': "translate(0px, 0px)",
      ':is([data-toolbar-direction="vertical"][data-toolbar-detached="true"] > [data-toolbar-item])':
        "translateY(0px)",
    },
    borderRadius: "var(--toolbar-detachable-radius)",
    borderStartStartRadius: {
      default: null,
      ':is([data-toolbar-detached="false"] > [data-toolbar-item]:not(:nth-child(1 of [data-toolbar-item])))': 0,
    },
    borderEndStartRadius: {
      default: null,
      ':is([data-toolbar-direction="horizontal"][data-toolbar-detached="false"] > [data-toolbar-item]:not(:nth-child(1 of [data-toolbar-item])))': 0,
      ':is([data-toolbar-direction="vertical"][data-toolbar-detached="false"] > [data-toolbar-item]:not(:nth-last-child(1 of [data-toolbar-item])))': 0,
    },
    borderStartEndRadius: {
      default: null,
      ':is([data-toolbar-direction="horizontal"][data-toolbar-detached="false"] > [data-toolbar-item]:not(:nth-last-child(1 of [data-toolbar-item])))': 0,
      ':is([data-toolbar-direction="vertical"][data-toolbar-detached="false"] > [data-toolbar-item]:not(:nth-child(1 of [data-toolbar-item])))': 0,
    },
    borderEndEndRadius: {
      default: null,
      ':is([data-toolbar-detached="false"] > [data-toolbar-item]:not(:nth-last-child(1 of [data-toolbar-item])))': 0,
    },
    transitionProperty:
      "transform, border-top-left-radius, border-top-right-radius, border-bottom-left-radius, border-bottom-right-radius",
    transitionDuration: {
      default: "0ms",
      ":is([data-toolbar-morph-ready] > [data-toolbar-item])": {
        default: "250ms",
        "@media (prefers-reduced-motion: reduce)": "0ms",
      },
    },
    transitionTimingFunction: tokens.motionEaseInOut,
  },
  button: {
    height: {
      default: 44,
      ":is([data-lenso-slot='toolbar-group'] *)": "var(--toolbar-group-button-height, 36px)",
      ":is([data-lenso-slot='toolbar'][data-attached] *)": 36,
    },
    minWidth: 36,
    paddingInline: 16,
    fontSize: 17,
    lineHeight: "22px",
    gap: 4,
  },
  iconButton: {
    width: {
      default: 44,
      ":is([data-lenso-slot='toolbar-group'] *)": "var(--toolbar-group-button-height, 36px)",
      ":is([data-lenso-slot='toolbar'][data-attached] *)": 36,
    },
    paddingInline: 0,
  },
  smallButton: { height: 36, fontSize: 15, lineHeight: "18px" },
  largeButton: { height: 48 },
  smallIcon: { width: 36 },
  largeIcon: { width: 48 },
  plain: {
    color: {
      default:
        "var(--lg-light-label, var(--lenso-control-tint, var(--lenso-material-action-label)))",
      ':is(:disabled, [aria-disabled="true"])': "var(--lenso-material-action-disabled-label)",
    },
    backgroundColor: "transparent",
    backgroundImage: "none",
    backdropFilter: "none",
    "--lenso-interaction-elevation": "0 0 0 transparent",
  },
  separator: { backgroundColor: tokens.separator, flexShrink: 0 },
  separatorHorizontal: { width: "50%", justifySelf: "center" },
  separatorVertical: { height: "50%", alignSelf: "center" },
  horizontalLine: { width: "50%", height: 1, justifySelf: "center" },
  verticalLine: { width: 1, height: "50%", alignSelf: "center" },
});
