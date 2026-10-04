// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 with-custom-submenu-indicator, Apache-2.0.
import { ArrowRight } from "@gravity-ui/icons";
import * as stylex from "@stylexjs/stylex";
import { Button, Menu, IconChevronRight, MenuItem } from "@lenso/ui";
import { ActionItem, Popup, styles } from "../../en/menu/_shared";
export function WithCustomSubmenuIndicator() {
  return (
    <Menu>
      <Menu.Trigger render={<Button aria-label="菜单" variant="secondary" />}>分享</Menu.Trigger>
      <Popup>
        <ActionItem label="复制链接" onClick={() => console.log("Selected: copy-link")} />
        <ActionItem label="Facebook" onClick={() => console.log("Selected: facebook")} />
        <Menu.SubmenuRoot>
          <Menu.SubmenuTrigger label="分享">
            <MenuItem.Label>更多选项</MenuItem.Label>
            <MenuItem.SubmenuIndicator>
              <ArrowRight {...stylex.props(styles.smallIcon)} />
            </MenuItem.SubmenuIndicator>
          </Menu.SubmenuTrigger>
          <Popup>
            <ActionItem label="WhatsApp" />
            <ActionItem label="Telegram" />
            <Menu.SubmenuRoot>
              <Menu.SubmenuTrigger>
                <MenuItem.Label>邮件</MenuItem.Label>
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
                <ActionItem label="工作邮箱" />
                <ActionItem label="个人邮箱" />
              </Popup>
            </Menu.SubmenuRoot>
            <ActionItem label="Discord" />
          </Popup>
        </Menu.SubmenuRoot>
        <Menu.SubmenuRoot>
          <Menu.SubmenuTrigger label="其他">
            <MenuItem.Label>其他（默认指示器）</MenuItem.Label>
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
