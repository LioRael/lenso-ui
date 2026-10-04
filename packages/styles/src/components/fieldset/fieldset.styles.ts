// HeroUI v3.2.6, Apache-2.0.
// Modified by Lenso contributors: translated component styling to StyleX.
import * as stylex from "@stylexjs/stylex";
import { tokens } from "../../tokens.stylex.const.js";
export const fieldsetStyles = stylex.create({
  root: {
    display: "flex",
    flexDirection: "column",
    gap: 24,
    flex: "1 1 0",
    minWidth: 0,
    border: 0,
    padding: 0,
    margin: 0,
  },
  legend: { fontSize: 16, fontWeight: 500, color: tokens.foreground },
  group: { display: "flex", flexDirection: "column", gap: 16, width: "100%" },
  actions: { display: "flex", alignItems: "center", gap: 8, paddingTop: 4 },
});
