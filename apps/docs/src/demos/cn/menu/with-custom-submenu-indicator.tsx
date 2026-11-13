"use client";
import { usePlaygroundLog } from "../../shared/playground-log";

import { ArrowRight } from "@gravity-ui/icons";
import * as stylex from "@stylexjs/stylex";
import { GlassButton, Menu, IconChevronRight } from "@lenso/ui";
import { ActionItem, Popup, styles } from "../../en/menu/_shared";
export function WithCustomSubmenuIndicator() {
  const log = usePlaygroundLog();
  return (
    <Menu>
      <Menu.Trigger render={<GlassButton aria-label="菜单" variant="default" />}>分享</Menu.Trigger>
      <Popup>
        <ActionItem label="复制链接" onClick={() => log("Selected: copy-link")} />
        <ActionItem label="Facebook" onClick={() => log("Selected: facebook")} />
        <Menu.Sub>
          <Menu.SubTrigger aria-label="分享">
            <Menu.Item.Label>更多选项</Menu.Item.Label>
            <Menu.Item.SubmenuIndicator>
              <ArrowRight {...stylex.props(styles.smallIcon)} />
            </Menu.Item.SubmenuIndicator>
          </Menu.SubTrigger>
          <Menu.SubContent>
            <ActionItem label="WhatsApp" />
            <ActionItem label="Telegram" />
            <Menu.Sub>
              <Menu.SubTrigger>
                <Menu.Item.Label>邮件</Menu.Item.Label>
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
              </Menu.SubTrigger>
              <Menu.SubContent>
                <ActionItem label="工作邮箱" />
                <ActionItem label="个人邮箱" />
              </Menu.SubContent>
            </Menu.Sub>
            <ActionItem label="Discord" />
          </Menu.SubContent>
        </Menu.Sub>
        <Menu.Sub>
          <Menu.SubTrigger aria-label="其他">
            <Menu.Item.Label>其他（默认指示器）</Menu.Item.Label>
            <Menu.Item.SubmenuIndicator>
              <IconChevronRight {...stylex.props(styles.smallIcon)} />
            </Menu.Item.SubmenuIndicator>
          </Menu.SubTrigger>
          <Menu.SubContent>
            <ActionItem label="SMS" />
          </Menu.SubContent>
        </Menu.Sub>
      </Popup>
    </Menu>
  );
}
