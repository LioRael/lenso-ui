import * as stylex from "@stylexjs/stylex";
import { tokens } from "../../tokens.stylex.const.js";
export const buttonGroupStyles = stylex.create({
  root: {
    display: "inline-flex",
    height: "auto",
    alignItems: "stretch",
    justifyContent: "center",
    gap: 0,
    margin: 0,
    padding: 0,
    borderWidth: 0,
    minWidth: 0,
  },
  horizontal: { flexDirection: "row" },
  vertical: { flexDirection: "column" },
  fullWidth: { width: "100%" },
  detached: { gap: 4 },
  separator: {
    // Joined members draw their own seams; retained for existing compositions.
    display: "none",
    position: "absolute",
    pointerEvents: "none",
    borderRadius: tokens.shapeContentSm,
    backgroundColor: "currentColor",
    opacity: 0.15,
    transitionProperty: "opacity",
    transitionDuration: { default: "150ms", "@media (prefers-reduced-motion: reduce)": "0ms" },
    transitionTimingFunction: tokens.motionEaseSmooth,
  },
  separatorHorizontal: { insetInlineStart: -1, top: "25%", width: 1, height: "50%" },
  separatorVertical: { insetInlineStart: "25%", top: -1, width: "50%", height: 1 },
});

export const buttonGroupItemStyles = stylex.create({
  horizontal: {
    borderStartStartRadius: { default: 0, ":nth-child(1 of [data-lenso-group-item])": 1000 },
    borderEndStartRadius: { default: 0, ":nth-child(1 of [data-lenso-group-item])": 1000 },
    borderStartEndRadius: { default: 0, ":nth-last-child(1 of [data-lenso-group-item])": 1000 },
    borderEndEndRadius: { default: 0, ":nth-last-child(1 of [data-lenso-group-item])": 1000 },
    borderInlineStartWidth: 1,
    borderInlineStartStyle: "solid",
    borderInlineStartColor: {
      default: "color-mix(in srgb, var(--lenso-label-primary) 15%, transparent)",
      ":nth-child(1 of [data-lenso-group-item])": "transparent",
    },
    scale: "var(--lg-press-scale, 1 1)",
    translate: "var(--lg-press-translate, 0px 0px)",
    outlineOffset: -2,
    zIndex: { default: 0, ":focus-visible": 1 },
  },
  vertical: {
    width: "100%",
    borderStartStartRadius: { default: 0, ":nth-child(1 of [data-lenso-group-item])": 1000 },
    borderStartEndRadius: { default: 0, ":nth-child(1 of [data-lenso-group-item])": 1000 },
    borderEndStartRadius: { default: 0, ":nth-last-child(1 of [data-lenso-group-item])": 1000 },
    borderEndEndRadius: { default: 0, ":nth-last-child(1 of [data-lenso-group-item])": 1000 },
    borderBlockStartWidth: 1,
    borderBlockStartStyle: "solid",
    borderBlockStartColor: {
      default: "color-mix(in srgb, var(--lenso-label-primary) 15%, transparent)",
      ":nth-child(1 of [data-lenso-group-item])": "transparent",
    },
    scale: "var(--lg-press-scale, 1 1)",
    translate: "var(--lg-press-translate, 0px 0px)",
    outlineOffset: -2,
    zIndex: { default: 0, ":focus-visible": 1 },
  },
  stretch: { flex: "1 1 0", minWidth: 0 },
});
