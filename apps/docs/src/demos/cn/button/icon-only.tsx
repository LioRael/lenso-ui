"use client";

import { Ellipsis, Gear, TrashBin } from "@gravity-ui/icons";
import { Button } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { styles } from "../../en/button/source.stylex";
export function IconOnly() {
  return (
    <div {...stylex.props(styles.row)}>
      <Button isIconOnly aria-label="更多选项" variant="bordered">
        <Button.Icon>
          <Ellipsis />
        </Button.Icon>
      </Button>
      <Button isIconOnly aria-label="设置" variant="bordered">
        <Button.Icon>
          <Gear />
        </Button.Icon>
      </Button>
      <Button destructive isIconOnly aria-label="删除" variant="prominent">
        <Button.Icon>
          <TrashBin />
        </Button.Icon>
      </Button>
    </div>
  );
}
