"use client";

import * as stylex from "@stylexjs/stylex";
import { Button, Popover } from "@lenso/ui";
import { styles } from "../../en/popover/styles";
export function PopoverBasic() {
  return (
    <div {...stylex.props(styles.row)}>
      <Popover>
        <Popover.Trigger render={<Button />}>点击我</Popover.Trigger>
        <Popover.Portal>
          <Popover.Positioner sideOffset={16}>
            <Popover.Popup xstyle={styles.popup}>
              <Popover.Title>弹出层标题</Popover.Title>
              <Popover.Description xstyle={styles.description}>
                这是弹出层内容，你可以在这里放置任何内容。
              </Popover.Description>
            </Popover.Popup>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover>
    </div>
  );
}
