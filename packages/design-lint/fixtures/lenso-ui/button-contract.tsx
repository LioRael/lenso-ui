import { Button as ActionButton } from "@lenso/ui/button";
import * as stylex from "@stylexjs/stylex";
import { create as makeStyles } from "@stylexjs/stylex";

import { tokens as designTokens } from "@lenso/tokens/tokens.stylex";

const styles = makeStyles({
  layout: {
    marginInline: designTokens.space2,
    width: "86px",
  },
  layoutVariant: {
    marginBlock: designTokens.space1,
  },
  stateful: {
    backgroundColor: {
      ":hover": designTokens.colorActionPrimaryHover,
      default: designTokens.colorActionPrimary,
    },
    color: designTokens.colorActionPrimaryContent,
  },
});

declare const showLayoutVariant: boolean;

export function LensoButtonFixture() {
  return (
    <div {...stylex.props(styles.stateful)}>
      <ActionButton
        aria-label="Save"
        variant="secondary"
        xstyle={[styles.layout, showLayoutVariant && styles.layoutVariant]}
      >
        Save
      </ActionButton>
    </div>
  );
}
