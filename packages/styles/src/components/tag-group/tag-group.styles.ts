// HeroUI v3.2.6 tag-group.css adaptation, Apache-2.0.
import * as stylex from "@stylexjs/stylex";
import { tokens } from "../../tokens.stylex.const.js";
export const tagGroupStyles = stylex.create({
  root: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    gap: 4,
    outline: { default: "none", ":focus-visible": `2px solid ${tokens.focus}` },
    outlineOffset: 2,
  },
  list: { position: "relative", display: "flex", flexWrap: "wrap", gap: 6 },
});
