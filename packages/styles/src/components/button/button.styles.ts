import * as stylex from "@stylexjs/stylex";
import { tokens } from "../../tokens.stylex.const.js";

export const buttonStyles = stylex.create({
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
    borderColor: tokens.border,
    borderRadius: tokens.radius3xl,
    fontFamily: tokens.fontSans,
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
    transitionTimingFunction: `${tokens.easeSmooth}, ease-out, ease-out`,
    boxShadow: {
      default: "none",
      ":focus-visible": `0 0 0 2px ${tokens.background}, 0 0 0 4px ${tokens.focus}`,
    },
    opacity: {
      default: 1,
      ":disabled": tokens.disabledOpacity,
      ':is([aria-disabled="true"])': tokens.disabledOpacity,
    },
    pointerEvents: { default: "auto", ":disabled": "none", ':is([aria-disabled="true"])': "none" },
  },
  fullWidth: { width: "100%" },
  pending: { cursor: "default", pointerEvents: "none" },
  icon: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    alignSelf: "center",
    pointerEvents: "none",
    width: { default: 20, "@media (min-width: 640px)": 16 },
    height: { default: 20, "@media (min-width: 640px)": 16 },
    marginInline: -2,
    marginBlock: { default: 2, "@media (min-width: 640px)": 4 },
  },
  smallIcon: { width: 16, height: 16 },
  groupedHorizontal: {
    borderStartStartRadius: { default: 0, ":first-child": tokens.radius3xl },
    borderEndStartRadius: { default: 0, ":first-child": tokens.radius3xl },
    borderStartEndRadius: { default: 0, ":last-child": tokens.radius3xl },
    borderEndEndRadius: { default: 0, ":last-child": tokens.radius3xl },
    transform: { default: "none", ":active": "none" },
    zIndex: { default: 0, ":focus-visible": 10 },
  },
  groupedVertical: {
    borderStartStartRadius: { default: 0, ":first-child": tokens.radius3xl },
    borderStartEndRadius: { default: 0, ":first-child": tokens.radius3xl },
    borderEndStartRadius: { default: 0, ":last-child": tokens.radius3xl },
    borderEndEndRadius: { default: 0, ":last-child": tokens.radius3xl },
    transform: { default: "none", ":active": "none" },
    zIndex: { default: 0, ":focus-visible": 10 },
  },
  outlineHorizontal: {
    borderInlineStartWidth: { default: 0, ":first-child:not(:last-child)": 1 },
    borderInlineEndWidth: { default: 0, ":last-child:not(:first-child)": 1 },
  },
  outlineVertical: {
    borderTopWidth: { default: 0, ":first-child:not(:last-child)": 1 },
    borderBottomWidth: { default: 0, ":last-child:not(:first-child)": 1 },
  },
  stretch: { flex: 1 },
});
export const buttonSizes = stylex.create({
  sm: {
    height: { default: 36, "@media (min-width: 768px)": 32 },
    paddingInline: 12,
    fontSize: 14,
    lineHeight: "20px",
    transform: { default: "none", ":active": "scale(0.98)" },
  },
  md: {
    height: { default: 40, "@media (min-width: 768px)": 36 },
    paddingInline: 16,
    fontSize: 14,
    lineHeight: "20px",
    transform: { default: "none", ":active": "scale(0.97)" },
  },
  lg: {
    height: { default: 44, "@media (min-width: 768px)": 40 },
    paddingInline: 16,
    fontSize: 16,
    lineHeight: "24px",
    transform: { default: "none", ":active": "scale(0.96)" },
  },
});
export const buttonIconOnlySizes = stylex.create({
  sm: {
    width: { default: 36, "@media (min-width: 768px)": 32 },
    paddingInline: 0,
    paddingBlock: 0,
  },
  md: {
    width: { default: 40, "@media (min-width: 768px)": 36 },
    paddingInline: 0,
    paddingBlock: 0,
  },
  lg: {
    width: { default: 44, "@media (min-width: 768px)": 40 },
    paddingInline: 0,
    paddingBlock: 0,
  },
});
export const buttonVariants = stylex.create({
  primary: {
    backgroundColor: {
      default: tokens.accent,
      "@media (hover: hover)": { default: null, ":hover": tokens.accentHover },
      ":active": tokens.accentHover,
    },
    color: tokens.accentForeground,
  },
  secondary: {
    backgroundColor: {
      default: tokens.default,
      "@media (hover: hover)": { default: null, ":hover": tokens.defaultHover },
      ":active": tokens.defaultHover,
    },
    color: tokens.accentSoftForeground,
  },
  tertiary: {
    backgroundColor: {
      default: tokens.default,
      "@media (hover: hover)": { default: null, ":hover": tokens.defaultHover },
      ":active": tokens.defaultHover,
    },
    color: "inherit",
  },
  ghost: {
    backgroundColor: {
      default: "transparent",
      "@media (hover: hover)": { default: null, ":hover": tokens.default },
      ":active": tokens.default,
    },
    color: tokens.defaultForeground,
  },
  outline: {
    borderWidth: 1,
    backgroundColor: {
      default: "transparent",
      "@media (hover: hover)": {
        default: null,
        ":hover": `color-mix(in srgb, ${tokens.default} 60%, transparent)`,
      },
      ":active": tokens.default,
    },
    color: tokens.defaultForeground,
  },
  danger: {
    backgroundColor: {
      default: tokens.danger,
      "@media (hover: hover)": { default: null, ":hover": tokens.dangerHover },
      ":active": tokens.dangerHover,
    },
    color: tokens.dangerForeground,
  },
  "danger-soft": {
    backgroundColor: {
      default: tokens.dangerSoft,
      "@media (hover: hover)": { default: null, ":hover": tokens.dangerSoftHover },
      ":active": tokens.dangerSoftHover,
    },
    color: tokens.dangerSoftForeground,
  },
});
