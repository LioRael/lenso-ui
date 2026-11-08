// Glass surfaces adapted from MIT-licensed work by Kelvin Zhang; see THIRD_PARTY_NOTICES.md.
import { optical } from "../../optical.stylex.const.js";
import * as stylex from "@stylexjs/stylex";
import { focusRing } from "../../focus-ring.stylex.const.js";
import { tokens } from "../../tokens.stylex.const.js";

export const controlButtonStyles = stylex.create({
  root: {
    position: "relative",
    isolation: "isolate",
    display: "inline-flex",
    width: "fit-content",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    transformOrigin: "center",
    borderWidth: 0,
    borderStyle: "solid",
    borderColor: tokens.controlBorder,
    borderRadius: tokens.shapeContent3xl,
    fontFamily: tokens.fontBody,
    fontWeight: 500,
    paddingBlock: 0,
    whiteSpace: "nowrap",
    outlineStyle: "none",
    userSelect: "none",
    cursor: {
      default: tokens.cursorInteractive,
      ":disabled": tokens.cursorDisabled,
      ':is([aria-disabled="true"])': tokens.cursorDisabled,
    },
    WebkitTapHighlightColor: "transparent",
    transitionProperty: "transform, background-color, box-shadow",
    transitionDuration: {
      default: "250ms, 100ms, 100ms",
      "@media (prefers-reduced-motion: reduce)": "0ms",
    },
    transitionTimingFunction: `${tokens.motionEaseSmooth}, ease-out, ease-out`,
    boxShadow: {
      default: "none",
      ":focus-visible": focusRing.outer,
    },
    opacity: {
      default: 1,
      ":disabled": 0.5,
      ':is([aria-disabled="true"])': 0.5,
    },
    pointerEvents: { default: "auto", ":disabled": "none", ':is([aria-disabled="true"])': "none" },
  },
  material: {
    position: "relative",
    isolation: "auto",
    transform: "none",
    pointerEvents: "auto",
    boxShadow: { default: "none", ":focus-visible": "none" },
    display: "inline-flex",
    width: "fit-content",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    transformOrigin: "center",
    borderWidth: 0,
    borderStyle: "solid",
    borderColor: tokens.controlBorder,
    borderRadius: 20,
    fontFamily: "inherit",
    fontWeight: "inherit",
    lineHeight: "inherit",
    fontStyle: "inherit",
    touchAction: "manipulation",
    scale: "var(--lg-press-scale, 1 1)",
    translate: "var(--lg-press-translate, 0px 0px)",
    paddingBlock: 0,
    paddingLeft: { default: null, ":has(> [data-slot='button-icon']):not([data-icon='only'])": 12 },
    whiteSpace: "nowrap",
    userSelect: "none",
    cursor: {
      default: tokens.cursorInteractive,
      ":disabled": tokens.cursorDisabled,
      ':is([aria-disabled="true"])': tokens.cursorDisabled,
    },
    WebkitTapHighlightColor: "transparent",
    transitionProperty: "background-color",
    transitionDuration: { default: "200ms", ":is(:active, [data-lenso-pressed])": "0s" },
    transitionTimingFunction: "ease",
    outlineStyle: { default: "none", ":focus-visible": "solid" },
    outlineWidth: { default: 1.5, ":focus-visible": 1.5 },
    outlineColor: { default: "currentColor", ":focus-visible": "var(--lenso-focus-ring)" },
    outlineOffset: { default: 0, ":focus-visible": 2 },
    opacity: { default: 1, ":disabled": 0.35, ':is([aria-disabled="true"])': 0.35 },
  },
  tint: (color: string) => ({ "--lenso-control-tint": color }),
  fullWidth: { width: "100%" },
  pending: { cursor: "default", pointerEvents: "none" },
  glass: {
    backgroundImage: "var(--lg-rim, none)",
    backgroundSize: "100% 100%",
    backdropFilter: {
      default: "blur(var(--lg-blur, 3px)) var(--lg-filter, saturate(1.5))",
      ":is([data-copy])": "none",
    },
    boxShadow:
      "inset 0 0 0 .5px var(--lenso-material-control-edge), 0 1px 3px var(--lenso-material-control-drop)",
    "::after": {
      content: '""',
      position: "absolute",
      inset: 0,
      borderRadius: "inherit",
      pointerEvents: "none",
      backgroundImage: optical.pointerHighlight,
      opacity: { default: 0, ":is([data-lenso-pressed])": 1 },
      transitionProperty: "opacity",
      transitionDuration: { default: "220ms", ":is([data-lenso-pressed])": "0s" },
      transitionTimingFunction: "ease-in-out",
    },
    "@media (forced-colors: active)": {
      backdropFilter: "none",
      backgroundImage: "none",
      outline: "1px solid ButtonText",
    },
  },
  solid: {
    backgroundImage: "none",
    backdropFilter: "none",
    boxShadow: "none",
    scale: "1",
    translate: "0px",
  },
  solidNeutral: {
    backgroundColor: {
      default: tokens.backgroundSecondary,
      ":hover": tokens.backgroundGroupedTertiary,
      ":active": tokens.backgroundGroupedSecondary,
    },
  },
  icon: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    alignSelf: "center",
    pointerEvents: "none",
    width: 20,
    height: 20,
  },
  smallIcon: { width: 16, height: 16 },
  groupedHorizontal: {
    borderStartStartRadius: { default: 0, ":nth-child(1 of :not([data-base-ui-focus-guard]))": 20 },
    borderEndStartRadius: { default: 0, ":nth-child(1 of :not([data-base-ui-focus-guard]))": 20 },
    borderStartEndRadius: {
      default: 0,
      ":nth-last-child(1 of :not([data-base-ui-focus-guard]))": 20,
    },
    borderEndEndRadius: {
      default: 0,
      ":nth-last-child(1 of :not([data-base-ui-focus-guard]))": 20,
    },
    transform: { default: "none", ":active": "none" },
    zIndex: { default: 0, ":focus-visible": 10 },
  },
  groupedVertical: {
    borderStartStartRadius: { default: 0, ":nth-child(1 of :not([data-base-ui-focus-guard]))": 20 },
    borderStartEndRadius: { default: 0, ":nth-child(1 of :not([data-base-ui-focus-guard]))": 20 },
    borderEndStartRadius: {
      default: 0,
      ":nth-last-child(1 of :not([data-base-ui-focus-guard]))": 20,
    },
    borderEndEndRadius: {
      default: 0,
      ":nth-last-child(1 of :not([data-base-ui-focus-guard]))": 20,
    },
    transform: { default: "none", ":active": "none" },
    zIndex: { default: 0, ":focus-visible": 10 },
  },
  stretch: { flex: 1 },
});
export const controlButtonSizes = stylex.create({
  sm: {
    height: { default: 36, "@media (min-width: 768px)": 32 },
    paddingInline: 12,
    fontSize: 14,
    lineHeight: "inherit",
  },
  md: {
    height: 40,
    paddingInline: 16,
    fontSize: 14,
    lineHeight: "inherit",
  },
  lg: {
    height: { default: 44, "@media (min-width: 768px)": 40 },
    paddingInline: 16,
    fontSize: 16,
    lineHeight: "24px",
  },
});
export const controlButtonIconOnlySizes = stylex.create({
  sm: {
    width: { default: 36, "@media (min-width: 768px)": 32 },
    paddingInline: 0,
    paddingBlock: 0,
  },
  md: {
    width: 40,
    paddingInline: 0,
    paddingBlock: 0,
  },
  lg: {
    width: { default: 44, "@media (min-width: 768px)": 40 },
    paddingInline: 0,
    paddingBlock: 0,
  },
});
export const controlButtonVariants = stylex.create({
  filled: {
    backgroundColor: {
      default: "var(--lenso-control-tint, var(--lenso-tint))",
      ":disabled": "var(--lenso-control-tint, var(--lenso-tint))",
      "@media (hover: hover) and (pointer: fine)": {
        default: null,
        ":hover":
          "color-mix(in srgb, var(--lenso-control-tint, var(--lenso-tint)) 88%, var(--lenso-label-primary))",
        ":hover:is(:active, [data-lenso-pressed])":
          "color-mix(in srgb, var(--lenso-control-tint, var(--lenso-tint)) 85%, var(--lenso-label-primary))",
      },
      ":is(:active, [data-lenso-pressed])":
        "color-mix(in srgb, var(--lenso-control-tint, var(--lenso-tint)) 85%, var(--lenso-label-primary))",
    },
    color: "var(--lenso-control-on-tint, var(--lenso-label-on-tint))",
  },
  glass: {
    backgroundColor: {
      default: "var(--lenso-material-control-glass)",
      ":disabled": "var(--lenso-material-control-glass)",
      "@media (hover: hover) and (pointer: fine)": {
        default: null,
        ":hover": "var(--lenso-material-control-glass-active)",
      },
      ":is(:active, [data-lenso-pressed])": "var(--lenso-material-control-glass-active)",
    },
    color: "var(--lenso-control-tint, var(--lenso-label-primary))",
  },
  plain: {
    backgroundColor: {
      default: "transparent",
      "@media (hover: hover) and (pointer: fine)": {
        default: null,
        ":hover": "var(--lenso-material-control-glass)",
      },
      ":active": "var(--lenso-material-control-glass-active)",
    },
    color: "var(--lenso-control-tint, var(--lenso-label-primary))",
  },
});

// Content-area controls: independently implemented from the supplied Apple kit's layout specification.
export const buttonStyles = stylex.create({
  root: {
    position: "relative",
    display: "inline-flex",
    boxSizing: "border-box",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    width: "fit-content",
    border: 0,
    borderRadius: 1000,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    fontWeight: 400,
    fontStyle: "normal",
    textDecoration: "none",
    whiteSpace: "nowrap",
    userSelect: "none",
    touchAction: "manipulation",
    WebkitTapHighlightColor: "transparent",
    cursor: {
      default: "pointer",
      ":disabled": "default",
      ':is([aria-disabled="true"])': "default",
    },
    outline: { default: "none", ":focus-visible": "2px solid var(--lenso-focus-ring)" },
    outlineOffset: 3,
    boxShadow: {
      default: "inset 0 0 0 100vmax transparent",
      "@media (hover: hover) and (pointer: fine)": {
        default: null,
        ':hover:not(:focus-visible):not(:disabled, [aria-disabled="true"], [data-disabled], [data-pending])':
          "inset 0 0 0 100vmax var(--lenso-fill-secondary)",
      },
      ':focus-visible:not(:disabled, [aria-disabled="true"], [data-disabled], [data-pending])':
        "inset 0 0 0 100vmax var(--lenso-fill-primary)",
    },
    transitionProperty: "box-shadow",
    transitionDuration: { default: "120ms", "@media (prefers-reduced-motion: reduce)": "0ms" },
    "@media (forced-colors: active)": { outline: "1px solid ButtonText" },
  },
  tracking: { letterSpacing: "-0.4px" },
  destructiveTracking: { letterSpacing: "-0.23px" },
  destructiveLargeTracking: { letterSpacing: "-0.43px" },
  tintedBordered: {
    backgroundColor: {
      default: "color-mix(in srgb, var(--lenso-control-tint) 14%, transparent)",
      ':is(:disabled, [aria-disabled="true"])': "var(--lenso-fill-tertiary)",
    },
  },
  destructive: {
    "--lenso-control-tint": "var(--lenso-action-destructive)",
    "--lenso-control-on-tint": "var(--lenso-label-on-destructive)",
    "--lenso-control-tint-text": "var(--lenso-action-destructive-text)",
  },
  tint: (color: string) => ({ "--lenso-control-tint": color }),
  fullWidth: { width: "100%" },
  pending: { cursor: "progress" },
  iconOnly: {
    paddingInline: 0,
    paddingBlock: 0,
    aspectRatio: "1",
    width: "auto",
    borderRadius: 500,
  },
  icon: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    pointerEvents: "none",
    width: "1em",
    height: "1em",
  },
  largeBorderless: { borderRadius: 12 },
});
export const buttonSizes = stylex.create({
  sm: { height: 28, paddingInline: 10, paddingBlock: 4, fontSize: 15, lineHeight: "20px", gap: 3 },
  md: { height: 34, paddingInline: 14, paddingBlock: 7, fontSize: 15, lineHeight: "20px", gap: 4 },
  lg: { height: 50, paddingInline: 20, paddingBlock: 14, fontSize: 17, lineHeight: "22px", gap: 4 },
});
export const buttonVariants = stylex.create({
  prominent: {
    backgroundColor: {
      default: "var(--lenso-control-tint, var(--lenso-tint))",
      ':is(:disabled, [aria-disabled="true"])': "var(--lenso-fill-tertiary)",
    },
    color: {
      default: "var(--lenso-control-on-tint, var(--lenso-label-on-tint))",
      ':is(:disabled, [aria-disabled="true"])': "var(--lenso-label-tertiary)",
    },
  },
  bordered: {
    backgroundColor: "var(--lenso-fill-tertiary)",
    color: {
      default: "var(--lenso-control-tint-text, var(--lenso-tint-text))",
      ':is(:disabled, [aria-disabled="true"])': "var(--lenso-label-tertiary)",
    },
  },
  borderless: {
    backgroundColor: "transparent",
    color: {
      default: "var(--lenso-control-tint-text, var(--lenso-tint-text))",
      ':is(:disabled, [aria-disabled="true"])': "var(--lenso-label-tertiary)",
    },
  },
});

export const buttonIconOnlySizes = stylex.create({
  sm: { width: 28 },
  md: { width: 34, fontSize: 17 },
  lg: { width: 50 },
});
