"use client";

import { Button, ButtonGroup } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { styles } from "../../en/button/source.stylex";
export function OutlineVariant() {
  return (
    <div {...stylex.props(styles.column)}>
      <div {...stylex.props(styles.section)}>
        <p {...stylex.props(styles.muted)}>按钮</p>
        <div {...stylex.props(styles.row)}>
          <Button variant="borderless">线框</Button>
        </div>
      </div>
      <div {...stylex.props(styles.section)}>
        <p {...stylex.props(styles.muted)}>按钮组</p>
        <ButtonGroup variant="borderless">
          <Button>第一项</Button>
          <Button>第二项</Button>
          <Button>第三项</Button>
        </ButtonGroup>
      </div>
    </div>
  );
}
