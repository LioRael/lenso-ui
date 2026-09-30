"use client";

// Adapted from HeroUI v3.2.6 with-submenus, Apache-2.0.
import * as stylex from "@stylexjs/stylex";
import { Button, Dropdown, IconChevronRight, MenuItem } from "@lenso/ui";
import { ActionItem, Popup, styles } from "./_shared";

export function WithSubmenus() {
  return (
    <Dropdown>
      <Dropdown.Trigger render={<Button aria-label="Menu" variant="secondary" />}>
        Share
      </Dropdown.Trigger>
      <Popup>
        <ActionItem label="Copy Link" onClick={() => console.log("Selected: copy-link")} />
        <ActionItem label="Facebook" onClick={() => console.log("Selected: facebook")} />
        <ActionItem
          label="X / Twitter"
          navigationLabel="Twitter"
          onClick={() => console.log("Selected: twitter")}
        />
        <Dropdown.SubmenuRoot>
          <Dropdown.SubmenuTrigger label="Share">
            <MenuItem.Label>Other</MenuItem.Label>
            <MenuItem.SubmenuIndicator>
              <IconChevronRight {...stylex.props(styles.smallIcon)} />
            </MenuItem.SubmenuIndicator>
          </Dropdown.SubmenuTrigger>
          <Popup>
            <ActionItem label="WhatsApp" />
            <ActionItem label="Telegram" />
            <ActionItem label="Discord" />
            <Dropdown.SubmenuRoot>
              <Dropdown.SubmenuTrigger>
                <MenuItem.Label>Email</MenuItem.Label>
                <MenuItem.SubmenuIndicator>
                  <IconChevronRight {...stylex.props(styles.smallIcon)} />
                </MenuItem.SubmenuIndicator>
              </Dropdown.SubmenuTrigger>
              <Popup>
                <ActionItem label="Work email" />
                <ActionItem label="Personal email" />
              </Popup>
            </Dropdown.SubmenuRoot>
          </Popup>
        </Dropdown.SubmenuRoot>
      </Popup>
    </Dropdown>
  );
}
