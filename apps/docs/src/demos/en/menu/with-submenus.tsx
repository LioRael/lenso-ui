"use client";
import { usePlaygroundLog } from "../../shared/playground-log";

import * as stylex from "@stylexjs/stylex";
import { GlassButton, Menu, IconChevronRight } from "@lenso/ui";
import { ActionItem, Popup, styles } from "./_shared";

export function WithSubmenus() {
  const log = usePlaygroundLog();
  return (
    <Menu>
      <Menu.Trigger render={<GlassButton aria-label="Menu" variant="default" />}>
        Share
      </Menu.Trigger>
      <Popup>
        <ActionItem label="Copy Link" onClick={() => log("Selected: copy-link")} />
        <ActionItem label="Facebook" onClick={() => log("Selected: facebook")} />
        <ActionItem
          label="X / Twitter"
          navigationLabel="Twitter"
          onClick={() => log("Selected: twitter")}
        />
        <Menu.Sub>
          <Menu.SubTrigger aria-label="Share">
            <Menu.Item.Label>Other</Menu.Item.Label>
            <Menu.Item.SubmenuIndicator>
              <IconChevronRight {...stylex.props(styles.smallIcon)} />
            </Menu.Item.SubmenuIndicator>
          </Menu.SubTrigger>
          <Menu.SubContent>
            <ActionItem label="WhatsApp" />
            <ActionItem label="Telegram" />
            <ActionItem label="Discord" />
            <Menu.Sub>
              <Menu.SubTrigger>
                <Menu.Item.Label>Email</Menu.Item.Label>
                <Menu.Item.SubmenuIndicator>
                  <IconChevronRight {...stylex.props(styles.smallIcon)} />
                </Menu.Item.SubmenuIndicator>
              </Menu.SubTrigger>
              <Menu.SubContent>
                <ActionItem label="Work email" />
                <ActionItem label="Personal email" />
              </Menu.SubContent>
            </Menu.Sub>
          </Menu.SubContent>
        </Menu.Sub>
      </Popup>
    </Menu>
  );
}
