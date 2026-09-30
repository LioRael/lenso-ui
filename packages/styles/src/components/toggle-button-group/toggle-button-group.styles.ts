import * as stylex from "@stylexjs/stylex";
import { tokens } from "../../tokens.stylex.const.js";
export const toggleButtonGroupStyles = stylex.create({
  root: {
    display: "inline-flex",
    height: "auto",
    width: "fit-content",
    alignItems: "center",
    justifyContent: "center",
    gap: 0,
  },
  horizontal: { flexDirection: "row" },
  vertical: { flexDirection: "column" },
  fullWidth: { width: "100%" },
  detached: { gap: 4 },
  separator: {
    position: "absolute",
    pointerEvents: "none",
    borderRadius: tokens.radiusSm,
    backgroundColor: "currentColor",
    opacity: 0.15,
    transitionProperty: "opacity",
    transitionDuration: { default: "150ms", "@media (prefers-reduced-motion: reduce)": "0ms" },
    transitionTimingFunction: tokens.easeSmooth,
  },
  separatorHorizontal: { insetInlineStart: -1, top: "25%", width: 1, height: "50%" },
  separatorVertical: { insetInlineStart: "25%", top: -1, width: "50%", height: 1 },
  hidden: { display: "none" },
});
