"use client";

// Adapted from HeroUI v3.2.6 popover-placement (Apache-2.0).
import * as stylex from "@stylexjs/stylex";
import { Button, Popover } from "@lenso/ui";
import { styles } from "./styles";

export function PopoverPlacement() {
  return (
    <div {...stylex.props(styles.grid)}>
      <div />
      <Popover>
        <Popover.Trigger render={<Button xstyle={styles.fullWidth} variant="tertiary" />}>
          Top
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Positioner side="top" sideOffset={8}>
            <Popover.Popup>
              <Popover.Arrow />
              <p {...stylex.props(styles.small)}>Top placement</p>
            </Popover.Popup>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover>
      <div />
      <Popover>
        <Popover.Trigger render={<Button xstyle={styles.fullWidth} variant="tertiary" />}>
          Left
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Positioner side="left" sideOffset={8}>
            <Popover.Popup>
              <Popover.Arrow />
              <p {...stylex.props(styles.small)}>Left placement</p>
            </Popover.Popup>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover>
      <div {...stylex.props(styles.center)}>
        <span {...stylex.props(styles.muted)}>Click buttons</span>
      </div>
      <Popover>
        <Popover.Trigger render={<Button xstyle={styles.fullWidth} variant="tertiary" />}>
          Right
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Positioner side="right" sideOffset={8}>
            <Popover.Popup>
              <Popover.Arrow />
              <p {...stylex.props(styles.small)}>Right placement</p>
            </Popover.Popup>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover>
      <div />
      <Popover>
        <Popover.Trigger render={<Button xstyle={styles.fullWidth} variant="tertiary" />}>
          Bottom
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Positioner side="bottom" sideOffset={8}>
            <Popover.Popup>
              <Popover.Arrow />
              <p {...stylex.props(styles.small)}>Bottom placement</p>
            </Popover.Popup>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover>
      <div />
    </div>
  );
}
