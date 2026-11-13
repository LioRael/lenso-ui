// Modified by Lenso contributors: translated component styling to StyleX.
import * as stylex from "@stylexjs/stylex";
import { tokens } from "../../tokens.stylex.const.js";
export const fieldsetStyles = stylex.create({
  root: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    flex: "1 1 0",
    minWidth: 0,
    border: 0,
    padding: 0,
    margin: 0,
  },
  legend: {
    paddingInline: 16,
    fontSize: 15,
    lineHeight: "20px",
    fontWeight: 400,
    color: tokens.labelSecondary,
  },
  group: { display: "flex", flexDirection: "column", containerType: "inline-size" },
  row: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) auto",
    alignItems: "center",
    columnGap: 12,
    rowGap: 4,
    paddingBlock: 8,
    minHeight: { default: 52, ":has(> [data-lenso-slot='description'])": 68 },
  },
  actions: { display: "flex", alignItems: "center", gap: 8, paddingTop: 4 },
});
