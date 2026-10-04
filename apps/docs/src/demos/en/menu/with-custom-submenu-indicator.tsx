"use client";

// Adapted from HeroUI v3.2.6 with-custom-submenu-indicator, Apache-2.0.
import { ArrowRight } from "@gravity-ui/icons";
import * as stylex from "@stylexjs/stylex";
import { Button, Menu, IconChevronRight, MenuItem } from "@lenso/ui";
import { ActionItem, Popup, styles } from "./_shared";

export function WithCustomSubmenuIndicator() {
  return (
    <Menu>
      <Menu.Trigger render={<Button aria-label="Menu" variant="secondary" />}>Share</Menu.Trigger>
      <Popup>
        <ActionItem label="Copy Link" onClick={() => console.log("Selected: copy-link")} />
        <ActionItem label="Facebook" onClick={() => console.log("Selected: facebook")} />
        <Menu.SubmenuRoot>
          <Menu.SubmenuTrigger label="Share">
            <MenuItem.Label>More options</MenuItem.Label>
            <MenuItem.SubmenuIndicator>
              <ArrowRight {...stylex.props(styles.smallIcon)} />
            </MenuItem.SubmenuIndicator>
          </Menu.SubmenuTrigger>
          <Popup>
            <ActionItem label="WhatsApp" />
            <ActionItem label="Telegram" />
            <Menu.SubmenuRoot>
              <Menu.SubmenuTrigger>
                <MenuItem.Label>Email</MenuItem.Label>
                <MenuItem.SubmenuIndicator>
                  <svg
                    {...stylex.props(styles.smallIcon)}
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </MenuItem.SubmenuIndicator>
              </Menu.SubmenuTrigger>
              <Popup>
                <ActionItem label="Work email" />
                <ActionItem label="Personal email" />
              </Popup>
            </Menu.SubmenuRoot>
            <ActionItem label="Discord" />
          </Popup>
        </Menu.SubmenuRoot>
        <Menu.SubmenuRoot>
          <Menu.SubmenuTrigger label="Other">
            <MenuItem.Label>Other (default indicator)</MenuItem.Label>
            <MenuItem.SubmenuIndicator>
              <IconChevronRight {...stylex.props(styles.smallIcon)} />
            </MenuItem.SubmenuIndicator>
          </Menu.SubmenuTrigger>
          <Popup>
            <ActionItem label="SMS" />
          </Popup>
        </Menu.SubmenuRoot>
      </Popup>
    </Menu>
  );
}
