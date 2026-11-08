// Copyright NextUI Inc. Apache-2.0. Modified for StyleX.
import * as stylex from "@stylexjs/stylex";
export const colorAreaStyles = stylex.create({
  root: {
    position: "relative",
    width: "100%",
    maxWidth: 224,
    flexShrink: 0,
    borderRadius: 20,
    aspectRatio: "1 / 1",
    boxShadow: "inset 0 0 0 1px var(--lenso-control-border)",
    touchAction: "none",
  },
  control: { position: "absolute", inset: 0, touchAction: "none" },
  secondaryAxis: { position: "absolute", inset: 0, pointerEvents: "none", opacity: 0 },
  dots: {
    "::after": {
      content: '""',
      pointerEvents: "none",
      position: "absolute",
      inset: 0,
      borderRadius: "inherit",
      backgroundImage: "radial-gradient(circle,rgba(255,255,255,.2) 1px,transparent 1px)",
      backgroundSize: "8px 8px",
    },
  },
  thumb: {
    position: "absolute",
    width: 36,
    height: 40,
    top: "50%",
    borderWidth: 0,
    backgroundColor: "transparent",
    outline: "none",
    touchAction: "none",
    cursor: { default: "grab", ":is([data-dragging])": "grabbing" },
    zIndex: 1,
  },
  verticalThumb: { width: 40, height: 36, top: "auto", left: "50%" },
  focused: { outline: "2px solid var(--lenso-focus-ring)", outlineOffset: 3 },
  dragging: { cursor: "grabbing" },
  disabled: { opacity: 0.35 },
});
