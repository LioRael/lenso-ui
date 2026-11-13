"use client";

import * as stylex from "@stylexjs/stylex";
import { Button, Popover } from "@lenso/ui";
import { styles } from "../../en/popover/styles";
export function PopoverPlacement() {
  return (
    <div {...stylex.props(styles.grid)}>
      <div />
      <Popover>
        <Popover.Trigger render={<Button xstyle={styles.fullWidth} />}>Top</Popover.Trigger>
        <Popover.Content side="top" sideOffset={16}>
          <Popover.Arrow />
          <p {...stylex.props(styles.small)}>顶部位置</p>
        </Popover.Content>
      </Popover>
      <div />
      <Popover>
        <Popover.Trigger render={<Button xstyle={styles.fullWidth} />}>Left</Popover.Trigger>
        <Popover.Content side="left" sideOffset={16}>
          <Popover.Arrow />
          <p {...stylex.props(styles.small)}>左侧位置</p>
        </Popover.Content>
      </Popover>
      <div {...stylex.props(styles.center)}>
        <span {...stylex.props(styles.muted)}>点击按钮</span>
      </div>
      <Popover>
        <Popover.Trigger render={<Button xstyle={styles.fullWidth} />}>Right</Popover.Trigger>
        <Popover.Content side="right" sideOffset={16}>
          <Popover.Arrow />
          <p {...stylex.props(styles.small)}>右侧位置</p>
        </Popover.Content>
      </Popover>
      <div />
      <Popover>
        <Popover.Trigger render={<Button xstyle={styles.fullWidth} />}>Bottom</Popover.Trigger>
        <Popover.Content side="bottom" sideOffset={16}>
          <Popover.Arrow />
          <p {...stylex.props(styles.small)}>底部位置</p>
        </Popover.Content>
      </Popover>
      <div />
    </div>
  );
}
