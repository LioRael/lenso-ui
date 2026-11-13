"use client";

import { Ellipsis } from "@gravity-ui/icons";
import * as stylex from "@stylexjs/stylex";
import { Button, Popover } from "@lenso/ui";
import { styles } from "./styles";

export function PopoverWithArrow() {
  return (
    <div {...stylex.props(styles.row)}>
      <Popover>
        <Popover.Trigger render={<Button />}>With Arrow</Popover.Trigger>
        <Popover.Content xstyle={styles.popup} sideOffset={16}>
          <Popover.Arrow />
          <Popover.Title>Popover with Arrow</Popover.Title>
          <Popover.Description xstyle={styles.description}>
            The arrow shows which element triggered the popover.
          </Popover.Description>
        </Popover.Content>
      </Popover>
      <Popover>
        <Popover.Trigger render={<Button isIconOnly aria-label="More options" />}>
          <Button.Icon>
            <Ellipsis />
          </Button.Icon>
        </Popover.Trigger>
        <Popover.Content xstyle={styles.popup} sideOffset={10}>
          <Popover.Arrow />
          <Popover.Title>Popover with Arrow</Popover.Title>
          <Popover.Description xstyle={styles.description}>
            The arrow shows which element triggered the popover.
          </Popover.Description>
        </Popover.Content>
      </Popover>
    </div>
  );
}
