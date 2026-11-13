import * as stylex from "@stylexjs/stylex";
import { focusRing } from "../../focus-ring.stylex.const.js";
import { tokens } from "../../tokens.stylex.const.js";
export const tabsStyles = stylex.create({
  root: { display: "flex", gap: 8, minWidth: 0, maxWidth: "100%", alignItems: "flex-start" },
  horizontal: { flexDirection: "column" },
  vertical: { flexDirection: "row" },
  verticalContainer: { flexShrink: 0 },
  overflowContainer: { width: "100%" },
  overflowRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "inherit",
    gap: 4,
    width: "100%",
    minWidth: 0,
    maxWidth: "100%",
  },
  overflowTrigger: { flexShrink: 0, rotate: { default: "0deg", ":dir(rtl)": "180deg" } },
  listContainer: {
    position: "relative",
    minWidth: 0,
    maxWidth: "100%",
    backgroundColor: "transparent",
    borderRadius: 1000,
  },
  scroller: {
    height: { default: "auto", ':is([data-orientation="vertical"])': "100%" },
  },
  list: {
    position: "relative",
    display: "inline-flex",
    anchorScope: "--lenso-tabs-active",
    padding: 2,
    borderRadius: 1000,
    touchAction: "pan-y",
    userSelect: "none",
    WebkitTapHighlightColor: "transparent",
    "--lg-tabs-indicator-inset": "0px",
    "--lg-tab-width": "84px",
    "--lg-tab-height": "28px",
    "--lg-lens-grow-x": "27px",
    "--lg-lens-grow-y": "20px",
  },
  glassList: { "--lg-tabs-indicator-inset": "2px" },
  large: { "--lg-tab-height": "46px" },
  bleed: (pixels: number) => ({
    padding: pixels,
    margin: -pixels,
    maxWidth: `calc(100% + ${pixels * 2}px)`,
  }),
  plain: {
    backgroundColor: "var(--lenso-fill-tertiary)",
    backdropFilter: "none",
    backgroundImage: "none",
    boxShadow: "none",
  },
  lift: (pixels: number) => ({
    "--lg-lens-grow-x": `${Math.round((pixels * 4) / 3)}px`,
    "--lg-lens-grow-y": `${pixels}px`,
  }),
  listHorizontal: { width: "max-content", flexDirection: "row", gap: 4 },
  listVertical: {
    flexDirection: "column",
    gap: 4,
    borderRadius: "calc(var(--lg-tab-height) / 2 + 2px)",
    touchAction: "pan-x",
  },
  rowVertical: { flexDirection: "column" },
  tab: {
    position: "relative",
    zIndex: 1,
    display: { default: "flex", ":is([data-tabs-overflow])": "none" },
    flexShrink: 0,
    width: "var(--lg-tab-width)",
    height: "var(--lg-tab-height)",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
    borderWidth: 0,
    borderStyle: "none",
    borderColor: "currentColor",
    borderRadius: "calc(var(--lg-tab-height) / 2)",
    color: {
      default: "var(--lenso-label-secondary)",
      "@media (hover: hover) and (pointer: fine)": {
        default: null,
        ":hover:not(:disabled, [data-disabled])": "var(--lenso-label-primary)",
      },
    },
    backgroundColor: "transparent",
    fontFamily: "inherit",
    fontWeight: 500,
    fontStyle: "inherit",
    fontSize: 13.333,
    lineHeight: "18px",
    letterSpacing: "-.08px",
    textDecoration: "none",
    textAlign: "center",
    cursor: { default: "pointer", ":disabled": "default", ":is([data-disabled])": "default" },
    opacity: { default: 1, ":disabled": 0.35, ":is([data-disabled])": 0.35 },
    outlineStyle: { default: "none", ":focus-visible:not(:is([data-pointer-focus] *))": "solid" },
    outlineWidth: { default: 1.5, ":focus-visible": 1.5 },
    outlineColor: { default: "currentColor", ":focus-visible": "var(--lenso-focus-ring)" },
    outlineOffset: { default: 0, ":focus-visible": -2 },
    transition: "color 200ms ease",
    WebkitTapHighlightColor: "transparent",
    maskImage: {
      default: "none",
      ":is(:is([data-lenso-slot='tabs-list'], [data-lenso-slot='segmented-control'])[data-ready]:not([data-hidden]) *)":
        "linear-gradient(#000 0 0), linear-gradient(#000 0 0), radial-gradient(circle closest-side, #000 99%, transparent 100%), radial-gradient(circle closest-side, #000 99%, transparent 100%)",
    },
    maskComposite: "exclude, add, add",
    maskRepeat: "no-repeat",
    maskSize:
      "100% 100%, var(--lg-tabs-mask-middle-size, 0px 0px), var(--lg-tabs-mask-diameter, 0px) var(--lg-tabs-mask-diameter, 0px), var(--lg-tabs-mask-diameter, 0px) var(--lg-tabs-mask-diameter, 0px)",
    maskPosition:
      "0 0, calc(var(--lg-tabs-mask-middle-x, 0px) - var(--lg-tabs-tab-x, 0px)) calc(var(--lg-tabs-mask-middle-y, 0px) - var(--lg-tabs-tab-y, 0px)), calc(var(--lg-tabs-mask-start-x, 0px) - var(--lg-tabs-tab-x, 0px)) calc(var(--lg-tabs-mask-start-y, 0px) - var(--lg-tabs-tab-y, 0px)), calc(var(--lg-tabs-mask-end-x, 0px) - var(--lg-tabs-tab-x, 0px)) calc(var(--lg-tabs-mask-end-y, 0px) - var(--lg-tabs-tab-y, 0px))",
  },
  tabVertical: { minWidth: 80 },
  initialTab: {
    anchorName: {
      default: "none",
      ":is(:is([aria-selected=true], [aria-checked=true]))": "--lenso-tabs-active",
    },
    "::before": {
      content: '""',
      position: "absolute",
      inset: "var(--lg-tabs-indicator-inset, 0px)",
      borderRadius: 1000,
      backgroundColor: "var(--lenso-control-segment-selected)",
      pointerEvents: "none",
      zIndex: -1,
      display: {
        default: "none",
        "@supports not (anchor-scope: --lenso-tabs-active)": {
          default: null,
          ":is(:is([data-lenso-slot='tabs-list'], [data-lenso-slot='segmented-control']):not([data-ready]):has(:is([data-lenso-slot='tabs-tint'], [data-lenso-slot='segmented-control-tint'])) :is([data-lenso-slot='tabs-tab'], [data-lenso-slot='segmented-control-item']):is([aria-selected=true], [aria-checked=true]))":
            "block",
        },
      },
    },
  },
  initialIndicator: {
    borderRadius: 1000,
    positionAnchor: "--lenso-tabs-active",
    left: {
      default: "calc(2px + var(--lg-tabs-indicator-inset, 0px))",
      ":is(:is([data-lenso-slot='tabs-list'], [data-lenso-slot='segmented-control']):not([data-ready]) *)":
        "calc(anchor(left, 2px) + var(--lg-tabs-indicator-inset, 0px))",
    },
    right: {
      default: "auto",
      ":is(:is([data-lenso-slot='tabs-list'], [data-lenso-slot='segmented-control']):not([data-ready]) *)":
        "auto",
    },
    top: {
      default: "calc(2px + var(--lg-tabs-indicator-inset, 0px))",
      ":is(:is([data-lenso-slot='tabs-list'], [data-lenso-slot='segmented-control']):not([data-ready]) *)":
        "calc(anchor(top, 2px) + var(--lg-tabs-indicator-inset, 0px))",
    },
    width: {
      default:
        "calc(var(--active-tab-width, var(--lg-tab-width)) - 2 * var(--lg-tabs-indicator-inset, 0px))",
      ":is(:is([data-lenso-slot='tabs-list'], [data-lenso-slot='segmented-control']):not([data-ready]) *)":
        "calc(anchor-size(width) - 2 * var(--lg-tabs-indicator-inset, 0px))",
    },
    height: {
      default:
        "calc(var(--active-tab-height, var(--lg-tab-height)) - 2 * var(--lg-tabs-indicator-inset, 0px))",
      ":is(:is([data-lenso-slot='tabs-list'], [data-lenso-slot='segmented-control']):not([data-ready]) *)":
        "calc(anchor-size(height) - 2 * var(--lg-tabs-indicator-inset, 0px))",
    },
    transform: {
      default: "var(--lg-tabs-transform, translateX(0px))",
      ":is(:is([data-lenso-slot='tabs-list'], [data-lenso-slot='segmented-control']):not([data-ready]) *)":
        "none",
    },
    zIndex: {
      default: 2,
      ":is(:is([data-lenso-slot='tabs-list'], [data-lenso-slot='segmented-control']):not([data-ready]) *)": 0,
      ":is(:is([data-lenso-slot='tabs-list'], [data-lenso-slot='segmented-control'])[data-ready] > :is([data-lenso-slot='tabs-tint'], [data-lenso-slot='segmented-control-tint']))": 3,
    },
    opacity: {
      default: 0,
      ":is(:is([data-lenso-slot='tabs-list'], [data-lenso-slot='segmented-control'])[data-ready]:not([data-hidden]) *)": 1,
      "@supports (anchor-scope: --lenso-tabs-active)": {
        default: null,
        ":is(:is([data-lenso-slot='tabs-list'], [data-lenso-slot='segmented-control']):not([data-ready]):has(:is([data-lenso-slot='tabs-tab'], [data-lenso-slot='segmented-control-item']):is([aria-selected=true], [aria-checked=true])) *)": 1,
      },
    },
  },
  alignStart: { justifyContent: "start", textAlign: "start" },
  alignEnd: { justifyContent: "end", textAlign: "end" },
  separator: {
    position: "absolute",
    pointerEvents: "none",
    borderRadius: tokens.shapeContentSm,
    backgroundColor: `color-mix(in srgb, ${tokens.labelSecondary} 25%, transparent)`,
    opacity: {
      default: 1,
      ":is(:is([aria-selected=true], [aria-checked=true]) *)": 0,
      ':is(:is([aria-selected=true], [aria-checked=true]) + :is([data-lenso-slot="tabs-tab"], [data-lenso-slot="segmented-control-item"]) *)': 0,
    },
    transitionProperty: "opacity",
    transitionDuration: { default: "150ms", "@media (prefers-reduced-motion: reduce)": "0ms" },
    transitionTimingFunction: tokens.motionEaseSmooth,
  },
  separatorHorizontal: { insetInlineStart: 0, top: "25%", height: "50%", width: 1 },
  separatorVertical: { insetInlineStart: "5%", top: 0, height: 1, width: "90%" },
  panel: { width: "100%", padding: 8, outlineStyle: "none" },
  panelHorizontal: { marginTop: 16 },
  panelVertical: { marginInlineStart: 16 },
  indicator: {
    position: "absolute",
    zIndex: 2,
    transform: {
      default: "var(--lg-tabs-transform, translateX(calc(var(--active-tab-left, 2px) - 2px)))",
      ":dir(rtl)": "var(--lg-tabs-transform, translateX(calc(2px - var(--active-tab-right, 2px))))",
    },
    left: { default: "calc(2px + var(--lg-tabs-indicator-inset, 0px))", ":dir(rtl)": "auto" },
    right: { default: "auto", ":dir(rtl)": "calc(2px + var(--lg-tabs-indicator-inset, 0px))" },
    top: "calc(2px + var(--lg-tabs-indicator-inset, 0px))",
    width:
      "calc(var(--active-tab-width, var(--lg-tab-width)) - 2 * var(--lg-tabs-indicator-inset, 0px))",
    height:
      "calc(var(--active-tab-height, var(--lg-tab-height)) - 2 * var(--lg-tabs-indicator-inset, 0px))",
    pointerEvents: "none",
    borderRadius: "calc(var(--lg-tab-height) / 2)",
  },
  fallback: {
    display: {
      default: "block",
      ":is(:is([data-lenso-slot='tabs-list'], [data-lenso-slot='segmented-control']):has(> [data-lg-tabs-lens='native']:not([hidden])) > *)":
        "none",
    },
  },
  glass: {
    position: "absolute",
    inset: 0,
    borderRadius: "inherit",
    pointerEvents: "none",
  },
  elastic: {
    scale: "var(--lg-press-scale, 1 1)",
    translate: "var(--lg-press-translate, 0px 0px)",
  },
  lens: {
    zIndex: 2,
    pointerEvents: "none",
    willChange: "transform",
    backgroundColor: "transparent",
    backgroundImage: "none",
    backdropFilter: "none",
    backgroundSize: "100% 100%",
    boxShadow: "0 2px 20px rgb(0 0 0 / .06)",
    opacity: { default: 1, ":is([data-hidden] *)": 0 },
    transition: "opacity 140ms ease, background-color 140ms ease",
    transitionDuration: { default: "140ms, 140ms", ":is([data-lifted] *)": "100ms" },
    "::before": {
      content: '""',
      position: "absolute",
      inset: 0,
      borderRadius: "inherit",
      backgroundColor: "transparent",
      opacity: { default: 1, ":is([data-lifted] *)": 0 },
      transition: "opacity 140ms ease",
      transitionDuration: { default: "140ms", ":is([data-lifted] *)": "100ms" },
    },
    "::after": { opacity: { default: 0, ":is([data-pressed])": 0.2 } },
  },
  refraction: {
    "--control-knob-face": ".09",
    position: "absolute",
    inset: 0,
    borderRadius: "inherit",
    pointerEvents: "none",
    // Fading this ancestor isolates the knob's backdrop until opacity reaches 1.
    // The spring already animates the lens geometry; switch its paint atomically.
    visibility: { default: "hidden", ":is([data-refracting] *)": "visible" },
  },
  tint: {
    outlineStyle: {
      default: "none",
      ":is(:is([data-lenso-slot='tabs-list'], [data-lenso-slot='segmented-control']):not([data-pointer-focus]):has(> :is([data-lenso-slot='tabs-tab'][aria-selected='true'], [data-lenso-slot='segmented-control-item'][aria-checked='true']):focus-visible) > *)":
        "solid",
    },
    outlineWidth: 1.5,
    outlineOffset: -2,
    outlineColor: tokens.focusRing,
    backgroundColor: {
      default: "var(--lenso-control-segment-selected)",
      ":is([data-lifted] *)": "transparent",
    },
    position: "absolute",
    top: "calc(2px + var(--lg-tabs-indicator-inset, 0px))",
    left: { default: "calc(2px + var(--lg-tabs-indicator-inset, 0px))", ":dir(rtl)": "auto" },
    right: { default: "auto", ":dir(rtl)": "calc(2px + var(--lg-tabs-indicator-inset, 0px))" },
    width: "calc(var(--lg-tab-width) - 2 * var(--lg-tabs-indicator-inset, 0px))",
    height: "calc(var(--lg-tab-height) - 2 * var(--lg-tabs-indicator-inset, 0px))",
    transform: "var(--lg-tabs-transform, translateX(0px))",
    overflow: "hidden",
    borderRadius: "calc(var(--lg-tab-height) / 2)",
    zIndex: {
      default: 0,
      ":is(:is([data-lenso-slot='tabs-list'], [data-lenso-slot='segmented-control'])[data-ready] *)": 3,
    },
    pointerEvents: "none",
    color: "var(--lenso-label-primary)",
    willChange: "transform",
    opacity: { default: 1, ":is([data-hidden] *)": 0 },
    transition: {
      default: "opacity 140ms ease, background-color 140ms ease",
      "@media (prefers-reduced-motion: reduce)": "none",
    },
    transitionDuration: { default: "140ms, 140ms", ":is([data-lifted] *)": "100ms, 100ms" },
  },
  highlightClip: { position: "absolute", inset: 0, borderRadius: "inherit", pointerEvents: "none" },
  highlightOptics: {
    position: "absolute",
    inset: 0,
    borderRadius: "inherit",
    pointerEvents: "none",
    "--lg-material": "none",
    "--lg-refraction": "1.25",
    "--lg-dispersion": ".25",
    filter: {
      default: "var(--lg-filter, none)",
      "@media (forced-colors: active), (prefers-reduced-transparency: reduce)": "none",
    },
  },
  row: { display: "flex", gap: 4, height: "100%", transformOrigin: "0 0", willChange: "transform" },
  copy: {
    display: "flex",
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    width: "var(--lg-tab-width)",
    height: "var(--lg-tab-height)",
    fontFamily: "inherit",
    fontStyle: "inherit",
    fontWeight: 600,
    fontSize: 13.333,
    lineHeight: "18px",
    letterSpacing: "-.08px",
  },
  showPrevious: {
    display: {
      default: "none",
      ':is([data-lenso-slot="tabs-list-container"]:has(> :is([data-left-scroll="true"], [data-left-right-scroll="true"], [data-top-scroll="true"], [data-top-bottom-scroll="true"])) > *)':
        "inline-flex",
    },
  },
  showNext: {
    display: {
      default: "none",
      ':is([data-lenso-slot="tabs-list-container"]:has(> :is([data-right-scroll="true"], [data-left-right-scroll="true"], [data-bottom-scroll="true"], [data-top-bottom-scroll="true"])) > *)':
        "inline-flex",
    },
  },
  scrollButton: {
    position: "absolute",
    zIndex: 2,
    display: "inline-flex",
    width: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "50%",
    borderWidth: 0,
    backgroundColor: "transparent",
    padding: 0,
    color: tokens.labelPrimary,
    cursor: tokens.cursorInteractive,
    outlineStyle: "none",
    boxShadow: {
      default: "none",
      ":focus-visible": focusRing.outer,
    },
    opacity: { default: 1, "@media (hover: hover)": { default: null, ":hover": 0.7 } },
    transitionProperty: "opacity",
    transitionDuration: { default: "150ms", "@media (prefers-reduced-motion: reduce)": "0ms" },
    transitionTimingFunction: tokens.motionEaseSmooth,
  },
  previousHorizontal: {
    insetInlineStart: 4,
    top: "50%",
    translate: "0 -50%",
    rotate: { default: "0deg", ":dir(rtl)": "180deg" },
  },
  nextHorizontal: {
    insetInlineEnd: 4,
    top: "50%",
    translate: "0 -50%",
    rotate: { default: "0deg", ":dir(rtl)": "180deg" },
  },
  previousVertical: {
    top: "calc(2px + var(--lg-tabs-indicator-inset, 0px))",
    left: "50%",
    translate: "-50% 0",
    rotate: "90deg",
  },
  nextVertical: { bottom: 4, left: "50%", translate: "-50% 0", rotate: "90deg" },
});
