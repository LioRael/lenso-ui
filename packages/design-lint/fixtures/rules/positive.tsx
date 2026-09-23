import { create as makeStyles } from "@stylexjs/stylex";

import { tokens } from "@lenso/tokens/tokens.stylex";

export const styles = makeStyles({
  root: {
    backgroundColor: {
      ":hover": tokens.colorActionPrimary,
      default: tokens.colorContentPrimary,
    },
    borderRadius: tokens.radiusControl,
    paddingInline: tokens.space2,
  },
});
