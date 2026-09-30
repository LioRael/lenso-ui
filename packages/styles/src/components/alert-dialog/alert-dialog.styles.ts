// Adapted from HeroUI v3.2.6 (e385ac2), Apache-2.0.
import * as stylex from "@stylexjs/stylex";
import { tokens } from "../../tokens.stylex.const.js";
export { modalStyles as alertDialogStyles } from "../modal/modal.styles.js";
export const alertDialogIconStyles = stylex.create({
  default: { backgroundColor: tokens.default, color: tokens.foreground },
  accent: { backgroundColor: tokens.accentSoft, color: tokens.accentSoftForeground },
  success: { backgroundColor: tokens.successSoft, color: tokens.successSoftForeground },
  warning: { backgroundColor: tokens.warningSoft, color: tokens.warningSoftForeground },
  danger: { backgroundColor: tokens.dangerSoft, color: tokens.dangerSoftForeground },
});
