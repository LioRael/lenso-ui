// Copyright NextUI Inc. Licensed Apache-2.0. Modified for Lenso StyleX.
import * as stylex from "@stylexjs/stylex";
import { tokens } from "../../tokens.stylex.const.js";

export const dateFieldStyles = stylex.create({
  root: { display: "flex", flexDirection: "column", gap: 4 },
  fullWidth: { width: "100%" },
  label: { width: "fit-content" },
  description: { fontSize: 12, color: tokens.labelSecondary },
  error: { fontSize: 12, color: tokens.statusErrorText },
  hidden: { display: "none" },
});
