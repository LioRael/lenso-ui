/**
 * Derived from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e).
 * Copyright NextUI Inc. Licensed Apache-2.0. Modified for Lenso StyleX.
 */
import * as stylex from "@stylexjs/stylex";
import { tokens } from "../../tokens.stylex.const.js";

export const dateFieldStyles = stylex.create({
  root: { display: "flex", flexDirection: "column", gap: 4 },
  fullWidth: { width: "100%" },
  label: { width: "fit-content" },
  description: { fontSize: 12, color: tokens.muted },
  error: { fontSize: 12, color: tokens.danger },
  hidden: { display: "none" },
});
