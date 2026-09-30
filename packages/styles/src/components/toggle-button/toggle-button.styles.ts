import * as stylex from "@stylexjs/stylex";
import { tokens } from "../../tokens.stylex.const.js";
export const toggleButtonStyles = stylex.create({
  root: {
    backgroundColor: {
      default: tokens.default,
      "@media (hover: hover)": { default: null, ":hover": tokens.defaultHover },
      ":active": tokens.defaultHover,
      ":is([data-pressed])": tokens.accentSoft,
    },
    color: { default: "inherit", ":is([data-pressed])": tokens.accentSoftForeground },
  },
  ghost: {
    backgroundColor: {
      default: "transparent",
      "@media (hover: hover)": { default: null, ":hover": tokens.default },
      ":active": tokens.default,
      ":is([data-pressed])": tokens.accentSoft,
    },
    color: {
      default: tokens.defaultForeground,
      ":is([data-pressed])": tokens.accentSoftForeground,
    },
  },
  selectedHover: {
    backgroundColor: {
      default: null,
      "@media (hover: hover)": {
        default: null,
        ":is([data-pressed]):hover": tokens.accentSoftHover,
      },
      ":is([data-pressed]):active": tokens.accentSoftHover,
    },
  },
  grouped: { boxShadow: { default: "none", ":focus-visible": `inset 0 0 0 2px ${tokens.focus}` } },
});
