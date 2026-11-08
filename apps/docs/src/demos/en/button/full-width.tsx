"use client";
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
