"use client";

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
      <Button variant="bordered">
        <Button.Icon>
          <Plus />
        </Button.Icon>
        添加成员
      </Button>
      <Button variant="bordered">
        <Button.Icon>
          <Envelope />
        </Button.Icon>
        邮件
      </Button>
      <Button destructive variant="prominent">
        <Button.Icon>
          <TrashBin />
        </Button.Icon>
        删除
      </Button>
    </div>
  );
}
