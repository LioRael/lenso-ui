"use client";

import { Plus } from "@gravity-ui/icons";
import { Button } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { styles } from "../../en/button/source.stylex";
export function FullWidth() {
  return (
    <div {...stylex.props(styles.full)}>
      <Button fullWidth>主要按钮</Button>
      <Button fullWidth>
        <Button.Icon>
          <Plus />
        </Button.Icon>
        带图标
      </Button>
    </div>
  );
}
