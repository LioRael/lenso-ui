// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 (e385ac2), Apache-2.0.
import { Envelope, Globe, Plus, TrashBin } from "@gravity-ui/icons";
import { Button } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { styles } from "../../en/button/source.stylex";
export function WithIcons() {
  return (
    <div {...stylex.props(styles.row)}>
      <Button>
        <Button.Icon>
          <Globe />
        </Button.Icon>
        搜索
      </Button>
      <Button variant="secondary">
        <Button.Icon>
          <Plus />
        </Button.Icon>
        添加成员
      </Button>
      <Button variant="tertiary">
        <Button.Icon>
          <Envelope />
        </Button.Icon>
        邮件
      </Button>
      <Button variant="danger">
        <Button.Icon>
          <TrashBin />
        </Button.Icon>
        删除
      </Button>
    </div>
  );
}
