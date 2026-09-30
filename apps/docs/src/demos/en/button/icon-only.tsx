"use client";
// Adapted from HeroUI v3.2.6 (e385ac2), Apache-2.0.
import { Ellipsis, Gear, TrashBin } from "@gravity-ui/icons";
import { Button } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { styles } from "./source.stylex";
export function IconOnly() {
  return (
    <div {...stylex.props(styles.row)}>
      <Button isIconOnly aria-label="More options" variant="tertiary">
        <Button.Icon>
          <Ellipsis />
        </Button.Icon>
      </Button>
      <Button isIconOnly aria-label="Settings" variant="secondary">
        <Button.Icon>
          <Gear />
        </Button.Icon>
      </Button>
      <Button isIconOnly aria-label="Delete" variant="danger">
        <Button.Icon>
          <TrashBin />
        </Button.Icon>
      </Button>
    </div>
  );
}
