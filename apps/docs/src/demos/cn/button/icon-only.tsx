// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 (e385ac2), Apache-2.0.
import { Ellipsis, Gear, TrashBin } from "@gravity-ui/icons";
import { Button } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { styles } from "../../en/button/source.stylex";
export function IconOnly() {
  return (
    <div {...stylex.props(styles.row)}>
      <Button isIconOnly aria-label="更多选项" variant="tertiary">
        <Button.Icon>
          <Ellipsis />
        </Button.Icon>
      </Button>
      <Button isIconOnly aria-label="设置" variant="secondary">
        <Button.Icon>
          <Gear />
        </Button.Icon>
      </Button>
      <Button isIconOnly aria-label="删除" variant="danger">
        <Button.Icon>
          <TrashBin />
        </Button.Icon>
      </Button>
    </div>
  );
}
