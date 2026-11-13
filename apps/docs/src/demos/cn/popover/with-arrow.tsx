"use client";

import { Ellipsis } from "@gravity-ui/icons";
import * as stylex from "@stylexjs/stylex";
import { Button, Popover } from "@lenso/ui";
import { styles } from "../../en/popover/styles";
export function PopoverWithArrow() {
  return (
    <div {...stylex.props(styles.row)}>
      <Popover>
        <Popover.Trigger render={<Button />}>带箭头</Popover.Trigger>
        <Popover.Content xstyle={styles.popup} sideOffset={16}>
          <Popover.Arrow />
          <Popover.Title>带箭头的弹出层</Popover.Title>
          <Popover.Description xstyle={styles.description}>
            箭头指向触发弹出层的元素。
          </Popover.Description>
        </Popover.Content>
      </Popover>
      <Popover>
        <Popover.Trigger render={<Button isIconOnly aria-label="更多选项" />}>
          <Button.Icon>
            <Ellipsis />
          </Button.Icon>
        </Popover.Trigger>
        <Popover.Content xstyle={styles.popup} sideOffset={10}>
          <Popover.Arrow />
          <Popover.Title>带箭头的弹出层</Popover.Title>
          <Popover.Description xstyle={styles.description}>
            箭头指向触发弹出层的元素。
          </Popover.Description>
        </Popover.Content>
      </Popover>
    </div>
  );
}
