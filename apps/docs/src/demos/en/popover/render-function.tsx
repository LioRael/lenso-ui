"use client";

// Adapted from HeroUI v3.2.6 popover-render-function (Apache-2.0).
import * as stylex from "@stylexjs/stylex";
import { Button, Popover } from "@lenso/ui";
import { styles } from "./styles";

export function RenderFunction() {
  return (
    <div {...stylex.props(styles.row)}>
      <Popover>
        <Popover.Trigger render={<Button />}>Click me</Popover.Trigger>
        <Popover.Portal>
          <Popover.Positioner sideOffset={8}>
            <Popover.Popup
              xstyle={styles.popup}
              render={(props) => <div {...props} data-custom="foo" />}
            >
              <Popover.Title>Popover Title</Popover.Title>
              <Popover.Description xstyle={styles.description}>
                This is the popover content. You can put any content here.
              </Popover.Description>
            </Popover.Popup>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover>
    </div>
  );
}
