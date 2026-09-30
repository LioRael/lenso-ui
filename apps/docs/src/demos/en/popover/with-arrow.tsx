"use client";

// Adapted from HeroUI v3.2.6 popover-with-arrow (Apache-2.0).
import { Ellipsis } from "@gravity-ui/icons";
import * as stylex from "@stylexjs/stylex";
import { Button, Popover } from "@lenso/ui";
import { styles } from "./styles";

export function PopoverWithArrow() {
  return (
    <div {...stylex.props(styles.row)}>
      <Popover>
        <Popover.Trigger render={<Button variant="secondary" />}>With Arrow</Popover.Trigger>
        <Popover.Portal>
          <Popover.Positioner sideOffset={8}>
            <Popover.Popup xstyle={styles.popup}>
              <Popover.Arrow />
              <Popover.Title>Popover with Arrow</Popover.Title>
              <Popover.Description xstyle={styles.description}>
                The arrow shows which element triggered the popover.
              </Popover.Description>
            </Popover.Popup>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover>
      <Popover>
        <Popover.Trigger
          render={<Button isIconOnly aria-label="More options" variant="tertiary" />}
        >
          <Button.Icon>
            <Ellipsis />
          </Button.Icon>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Positioner sideOffset={10}>
            <Popover.Popup xstyle={styles.popup}>
              <Popover.Arrow />
              <Popover.Title>Popover with Arrow</Popover.Title>
              <Popover.Description xstyle={styles.description}>
                The arrow shows which element triggered the popover.
              </Popover.Description>
            </Popover.Popup>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover>
    </div>
  );
}
