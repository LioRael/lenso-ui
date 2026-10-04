// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 popover-with-arrow (Apache-2.0).
import { Ellipsis } from "@gravity-ui/icons";
import * as stylex from "@stylexjs/stylex";
import { Button, Popover } from "@lenso/ui";
import { styles } from "../../en/popover/styles";
export function PopoverWithArrow() {
  return (
    <div {...stylex.props(styles.row)}>
      <Popover>
        <Popover.Trigger render={<Button variant="secondary" />}>带箭头</Popover.Trigger>
        <Popover.Portal>
          <Popover.Positioner sideOffset={8}>
            <Popover.Popup xstyle={styles.popup}>
              <Popover.Arrow />
              <Popover.Title>带箭头的弹出层</Popover.Title>
              <Popover.Description xstyle={styles.description}>
                箭头指向触发弹出层的元素。
              </Popover.Description>
            </Popover.Popup>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover>
      <Popover>
        <Popover.Trigger render={<Button isIconOnly aria-label="更多选项" variant="tertiary" />}>
          <Button.Icon>
            <Ellipsis />
          </Button.Icon>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Positioner sideOffset={10}>
            <Popover.Popup xstyle={styles.popup}>
              <Popover.Arrow />
              <Popover.Title>带箭头的弹出层</Popover.Title>
              <Popover.Description xstyle={styles.description}>
                箭头指向触发弹出层的元素。
              </Popover.Description>
            </Popover.Popup>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover>
    </div>
  );
}
