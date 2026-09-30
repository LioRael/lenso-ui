// Adapted from HeroUI v3.2.6 (e385ac2), Apache-2.0.
import * as stylex from "@stylexjs/stylex";
import { tokens } from "../../tokens.stylex.const.js";
export const menuSectionStyles = stylex.create({
  root: { display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 0 },
  label: { paddingInline: 8, paddingBlock: 6, fontSize: 12, color: tokens.muted },
});
