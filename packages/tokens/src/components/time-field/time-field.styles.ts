/**
 * Copyright NextUI Inc.
 * Modified for Lenso StyleX.
 */
import * as stylex from "@stylexjs/stylex";
import { tokens } from "../../tokens.stylex.const.js";

export const timeFieldStyles = stylex.create({
  root: { display: "flex", flexDirection: "column", gap: 4 },
  fullWidth: { width: "100%" },
  label: { width: "fit-content", fontSize: 14, color: tokens.labelPrimary },
  description: { fontSize: 12, color: tokens.labelSecondary },
  error: { fontSize: 12, color: tokens.statusErrorText },
  hidden: { display: "none" },
});
