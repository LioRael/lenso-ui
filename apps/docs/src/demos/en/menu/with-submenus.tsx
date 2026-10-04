"use client";

// Adapted from HeroUI v3.2.6 with-submenus, Apache-2.0.
import * as stylex from "@stylexjs/stylex";
import { Button, Menu, IconChevronRight, MenuItem } from "@lenso/ui";
import { ActionItem, Popup, styles } from "./_shared";

export function WithSubmenus() {
  return (
    <Menu>
      <Menu.Trigger render={<Button aria-label="Menu" variant="secondary" />}>Share</Menu.Trigger>
      <Popup>
        <ActionItem label="Copy Link" onClick={() => console.log("Selected: copy-link")} />
        <ActionItem label="Facebook" onClick={() => console.log("Selected: facebook")} />
        <ActionItem
          label="X / Twitter"
          navigationLabel="Twitter"
          onClick={() => console.log("Selected: twitter")}
        />
        <Menu.SubmenuRoot>
          <Menu.SubmenuTrigger label="Share">
            <MenuItem.Label>Other</MenuItem.Label>
            <MenuItem.SubmenuIndicator>
              <IconChevronRight {...stylex.props(styles.smallIcon)} />
            </MenuItem.SubmenuIndicator>
          </Menu.SubmenuTrigger>
          <Popup>
            <ActionItem label="WhatsApp" />
            <ActionItem label="Telegram" />
            <ActionItem label="Discord" />
            <Menu.SubmenuRoot>
              <Menu.SubmenuTrigger>
                <MenuItem.Label>Email</MenuItem.Label>
                <MenuItem.SubmenuIndicator>
                  <IconChevronRight {...stylex.props(styles.smallIcon)} />
                </MenuItem.SubmenuIndicator>
              </Menu.SubmenuTrigger>
              <Popup>
                <ActionItem label="Work email" />
                <ActionItem label="Personal email" />
              </Popup>
            </Menu.SubmenuRoot>
          </Popup>
        </Menu.SubmenuRoot>
      </Popup>
    </Menu>
  );
}
