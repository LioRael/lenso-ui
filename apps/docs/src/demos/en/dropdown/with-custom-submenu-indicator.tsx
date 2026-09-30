"use client";

// Adapted from HeroUI v3.2.6 with-custom-submenu-indicator, Apache-2.0.
import { ArrowRight } from "@gravity-ui/icons";
import * as stylex from "@stylexjs/stylex";
import { Button, Dropdown, IconChevronRight, MenuItem } from "@lenso/ui";
import { ActionItem, Popup, styles } from "./_shared";

export function WithCustomSubmenuIndicator() {
  return (
    <Dropdown>
      <Dropdown.Trigger render={<Button aria-label="Menu" variant="secondary" />}>
        Share
      </Dropdown.Trigger>
      <Popup>
        <ActionItem label="Copy Link" onClick={() => console.log("Selected: copy-link")} />
        <ActionItem label="Facebook" onClick={() => console.log("Selected: facebook")} />
        <Dropdown.SubmenuRoot>
          <Dropdown.SubmenuTrigger label="Share">
            <MenuItem.Label>More options</MenuItem.Label>
            <MenuItem.SubmenuIndicator>
              <ArrowRight {...stylex.props(styles.smallIcon)} />
            </MenuItem.SubmenuIndicator>
          </Dropdown.SubmenuTrigger>
          <Popup>
            <ActionItem label="WhatsApp" />
            <ActionItem label="Telegram" />
            <Dropdown.SubmenuRoot>
              <Dropdown.SubmenuTrigger>
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
              </Dropdown.SubmenuTrigger>
              <Popup>
                <ActionItem label="Work email" />
                <ActionItem label="Personal email" />
              </Popup>
            </Dropdown.SubmenuRoot>
            <ActionItem label="Discord" />
          </Popup>
        </Dropdown.SubmenuRoot>
        <Dropdown.SubmenuRoot>
          <Dropdown.SubmenuTrigger label="Other">
            <MenuItem.Label>Other (default indicator)</MenuItem.Label>
            <MenuItem.SubmenuIndicator>
              <IconChevronRight {...stylex.props(styles.smallIcon)} />
            </MenuItem.SubmenuIndicator>
          </Dropdown.SubmenuTrigger>
          <Popup>
            <ActionItem label="SMS" />
          </Popup>
        </Dropdown.SubmenuRoot>
      </Popup>
    </Dropdown>
  );
}
