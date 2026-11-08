"use client";

import { ArrowRight } from "@gravity-ui/icons";
import * as stylex from "@stylexjs/stylex";
import { GlassButton, Menu, IconChevronRight } from "@lenso/ui";
import { ActionItem, Popup, styles } from "./_shared";

export function WithCustomSubmenuIndicator() {
  return (
    <Menu>
      <Menu.Trigger render={<GlassButton aria-label="Menu" variant="default" />}>
        Share
      </Menu.Trigger>
      <Popup>
        <ActionItem label="Copy Link" onClick={() => console.log("Selected: copy-link")} />
        <ActionItem label="Facebook" onClick={() => console.log("Selected: facebook")} />
        <Menu.SubmenuRoot>
          <Menu.SubmenuTrigger label="Share">
            <Menu.Item.Label>More options</Menu.Item.Label>
            <Menu.Item.SubmenuIndicator>
              <ArrowRight {...stylex.props(styles.smallIcon)} />
            </Menu.Item.SubmenuIndicator>
          </Menu.SubmenuTrigger>
          <Popup>
            <ActionItem label="WhatsApp" />
            <ActionItem label="Telegram" />
            <Menu.SubmenuRoot>
              <Menu.SubmenuTrigger>
                <Menu.Item.Label>Email</Menu.Item.Label>
                <Menu.Item.SubmenuIndicator>
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
                </Menu.Item.SubmenuIndicator>
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
            <Menu.Item.Label>Other (default indicator)</Menu.Item.Label>
            <Menu.Item.SubmenuIndicator>
              <IconChevronRight {...stylex.props(styles.smallIcon)} />
            </Menu.Item.SubmenuIndicator>
          </Menu.SubmenuTrigger>
          <Popup>
            <ActionItem label="SMS" />
          </Popup>
        </Menu.SubmenuRoot>
      </Popup>
    </Menu>
  );
}
