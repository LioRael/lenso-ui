/**
 * Derived from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e).
 * SPDX-License-Identifier: Apache-2.0
 * Modified: StyleX composition and Base UI selection selectors.
 */
import * as stylex from "@stylexjs/stylex";
import { tokens } from "../../tokens.stylex.const.js";
export const toggleButtonStyles = stylex.create({
  root: {
    backgroundColor: {
      default: tokens.default,
      "@media (hover: hover)": {
        default: null,
        ":hover": tokens.defaultHover,
        ":is([data-pressed]):hover": tokens.accentSoftHover,
      },
      ":active": tokens.defaultHover,
      ":is([data-pressed])": tokens.accentSoft,
      ":is([data-pressed]):active": tokens.accentSoftHover,
    },
    color: { default: "inherit", ":is([data-pressed])": tokens.accentSoftForeground },
  },
  ghost: {
    backgroundColor: {
      default: "transparent",
      "@media (hover: hover)": {
        default: null,
        ":hover": tokens.default,
        ":is([data-pressed]):hover": tokens.accentSoftHover,
      },
      ":active": tokens.default,
      ":is([data-pressed])": tokens.accentSoft,
      ":is([data-pressed]):active": tokens.accentSoftHover,
    },
    color: {
      default: tokens.defaultForeground,
      ":is([data-pressed])": tokens.accentSoftForeground,
    },
  },
  grouped: { boxShadow: { default: "none", ":focus-visible": `inset 0 0 0 2px ${tokens.focus}` } },
});
