"use client";
import { Ellipsis, Gear, TrashBin } from "@gravity-ui/icons";
import { Button } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { styles } from "./source.stylex";
export function IconOnly() {
  return (
    <div {...stylex.props(styles.row)}>
      <Button isIconOnly aria-label="More options" variant="bordered">
        <Button.Icon>
          <Ellipsis />
        </Button.Icon>
      </Button>
      <Button isIconOnly aria-label="Settings" variant="bordered">
        <Button.Icon>
          <Gear />
        </Button.Icon>
      </Button>
      <Button destructive isIconOnly aria-label="Delete" variant="prominent">
        <Button.Icon>
          <TrashBin />
        </Button.Icon>
      </Button>
    </div>
  );
}
