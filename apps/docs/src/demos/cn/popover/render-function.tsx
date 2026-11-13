"use client";

import * as stylex from "@stylexjs/stylex";
import { Button, Popover } from "@lenso/ui";
import { styles } from "../../en/popover/styles";
export function RenderFunction() {
  return (
    <div {...stylex.props(styles.row)}>
      <Popover>
        <Popover.Trigger render={<Button />}>点击我</Popover.Trigger>
        <Popover.Content
          xstyle={styles.popup}
          render={(props) => <div {...props} data-custom="foo" />}
          sideOffset={16}
        >
          <Popover.Title>弹出层标题</Popover.Title>
          <Popover.Description xstyle={styles.description}>
            这是弹出层内容，你可以在这里放置任何内容。
          </Popover.Description>
        </Popover.Content>
      </Popover>
    </div>
  );
}
