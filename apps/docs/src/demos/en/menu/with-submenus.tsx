"use client";

import * as stylex from "@stylexjs/stylex";
import { GlassButton, Menu, IconChevronRight } from "@lenso/ui";
import { ActionItem, Popup, styles } from "./_shared";

export function WithSubmenus() {
  return (
    <Menu>
      <Menu.Trigger render={<GlassButton aria-label="Menu" variant="default" />}>
        Share
      </Menu.Trigger>
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
            <Menu.Item.Label>Other</Menu.Item.Label>
            <Menu.Item.SubmenuIndicator>
              <IconChevronRight {...stylex.props(styles.smallIcon)} />
            </Menu.Item.SubmenuIndicator>
          </Menu.SubmenuTrigger>
          <Popup>
            <ActionItem label="WhatsApp" />
            <ActionItem label="Telegram" />
            <ActionItem label="Discord" />
            <Menu.SubmenuRoot>
              <Menu.SubmenuTrigger>
                <Menu.Item.Label>Email</Menu.Item.Label>
                <Menu.Item.SubmenuIndicator>
                  <IconChevronRight {...stylex.props(styles.smallIcon)} />
                </Menu.Item.SubmenuIndicator>
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
