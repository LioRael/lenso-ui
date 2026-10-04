// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 (e385ac2), Apache-2.0.
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
