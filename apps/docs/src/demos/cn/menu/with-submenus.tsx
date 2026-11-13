"use client";
import { usePlaygroundLog } from "../../shared/playground-log";

import * as stylex from "@stylexjs/stylex";
import { GlassButton, Menu, IconChevronRight } from "@lenso/ui";
import { ActionItem, Popup, styles } from "../../en/menu/_shared";
export function WithSubmenus() {
  const log = usePlaygroundLog();
  return (
    <Menu>
      <Menu.Trigger render={<GlassButton aria-label="菜单" variant="default" />}>分享</Menu.Trigger>
      <Popup>
        <ActionItem label="复制链接" onClick={() => log("Selected: copy-link")} />
        <ActionItem label="Facebook" onClick={() => log("Selected: facebook")} />
        <ActionItem
          label="X / Twitter"
          navigationLabel="Twitter"
          onClick={() => log("Selected: twitter")}
        />
        <Menu.Sub>
          <Menu.SubTrigger aria-label="分享">
            <Menu.Item.Label>其他</Menu.Item.Label>
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
                <Menu.Item.Label>邮件</Menu.Item.Label>
                <Menu.Item.SubmenuIndicator>
                  <IconChevronRight {...stylex.props(styles.smallIcon)} />
                </Menu.Item.SubmenuIndicator>
              </Menu.SubTrigger>
              <Menu.SubContent>
                <ActionItem label="工作邮箱" />
                <ActionItem label="个人邮箱" />
              </Menu.SubContent>
            </Menu.Sub>
          </Menu.SubContent>
        </Menu.Sub>
      </Popup>
    </Menu>
  );
}
