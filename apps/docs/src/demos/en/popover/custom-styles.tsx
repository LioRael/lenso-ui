"use client";

// Adapted from HeroUI v3.2.6 popover-custom-styles (Apache-2.0).
import * as stylex from "@stylexjs/stylex";
import { Button, Popover } from "@lenso/ui";
import { styles } from "./styles";

export function CustomStyles() {
  return (
    <Popover>
      <Popover.Trigger render={<Button variant="secondary" />}>Details</Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner sideOffset={8}>
          <Popover.Popup xstyle={styles.customPopup}>
            <div {...stylex.props(styles.customDialog)}>
              <div aria-hidden="true" {...stylex.props(styles.highlight)} />
              <Popover.Title xstyle={styles.customHeading}>Keyboard shortcuts</Popover.Title>
              <dl {...stylex.props(styles.shortcuts)}>
                <div {...stylex.props(styles.shortcut)}>
                  <dt {...stylex.props(styles.muted)}>Save</dt>
                  <dd {...stylex.props(styles.key)}>⌘ S</dd>
                </div>
                <div {...stylex.props(styles.shortcut)}>
                  <dt {...stylex.props(styles.muted)}>Search</dt>
                  <dd {...stylex.props(styles.key)}>⌘ K</dd>
                </div>
              </dl>
            </div>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover>
  );
}
