"use client";
// Adapted from HeroUI v3.2.6 (e385ac2), Apache-2.0.
import { Plus } from "@gravity-ui/icons";
import { Button } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { styles } from "./source.stylex";
export function FullWidth() {
  return (
    <div {...stylex.props(styles.full)}>
      <Button fullWidth>Primary Button</Button>
      <Button fullWidth>
        <Button.Icon>
          <Plus />
        </Button.Icon>
        With Icon
      </Button>
    </div>
  );
}
