// HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e), Apache-2.0.
// Modified by Lenso contributors: translated component styling to StyleX.
import * as stylex from "@stylexjs/stylex";
import { tokens } from "../../tokens.stylex.const.js";
export { inputGroupStyles as searchFieldGroupStyles } from "../input-group/input-group.styles.js";
export const searchFieldStyles = stylex.create({
  root: { display: "flex", flexDirection: "column", gap: 4 },
  icon: {
    width: 16,
    height: 16,
    marginInlineStart: 12,
    flexShrink: 0,
    color: tokens.fieldPlaceholder,
  },
  clear: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 24,
    height: 24,
    marginInlineEnd: 6,
    padding: 0,
    border: 0,
    borderRadius: tokens.radiusSm,
    backgroundColor: { default: "transparent", ":hover": tokens.defaultHover },
    color: tokens.muted,
    cursor: "pointer",
    outline: { default: "none", ":focus-visible": `2px solid ${tokens.focus}` },
    opacity: { default: 1, ":disabled": 0 },
    pointerEvents: { default: "auto", ":disabled": "none" },
  },
});
