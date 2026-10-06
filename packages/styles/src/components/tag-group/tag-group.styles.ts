// HeroUI v3.2.6 tag-group.css adaptation, Apache-2.0.
import * as stylex from "@stylexjs/stylex";
export const tagGroupStyles = stylex.create({
  root: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    gap: 4,
    outline: "none",
  },
  list: { position: "relative", display: "flex", flexWrap: "wrap", gap: 6 },
});
