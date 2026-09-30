/**
 * Derived from HeroUI v3.2.6. Apache-2.0, Copyright NextUI Inc.
 * Modified for Lenso StyleX.
 */
import * as stylex from "@stylexjs/stylex";
import { tokens } from "../../tokens.stylex.const.js";

export const colorFieldStyles = stylex.create({
  root: { display: "flex", flexDirection: "column", gap: 4 },
  fullWidth: { width: "100%" },
  label: { width: "fit-content", fontSize: 14, color: tokens.foreground },
  description: { fontSize: 12, color: tokens.muted },
  error: { fontSize: 12, color: tokens.danger },
  hidden: { display: "none" },
});
