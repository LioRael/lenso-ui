"use client";

import * as stylex from "@stylexjs/stylex";
import { Button, Popover } from "@lenso/ui";
import { styles } from "./styles";

export function RenderFunction() {
  return (
    <div {...stylex.props(styles.row)}>
      <Popover>
        <Popover.Trigger render={<Button />}>Click me</Popover.Trigger>
        <Popover.Content
          xstyle={styles.popup}
          render={(props) => <div {...props} data-custom="foo" />}
          sideOffset={16}
        >
          <Popover.Title>Popover Title</Popover.Title>
          <Popover.Description xstyle={styles.description}>
            This is the popover content. You can put any content here.
          </Popover.Description>
        </Popover.Content>
      </Popover>
    </div>
  );
}
