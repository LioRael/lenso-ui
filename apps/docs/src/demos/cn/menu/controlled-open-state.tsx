"use client";

import { useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { GlassButton, Menu } from "@lenso/ui";
import { ActionItem, Popup, styles } from "../../en/menu/_shared";
export function ControlledOpenState() {
  const [open, setOpen] = useState(false);
  return (
    <div {...stylex.props(styles.controlled)}>
      <p {...stylex.props(styles.status)}>
        Menu is: <strong>{open ? "打开" : "关闭"}</strong>
      </p>
      <Menu open={open} onOpenChange={setOpen}>
        <Menu.Trigger render={<GlassButton aria-label="菜单" variant="default" />}>
          操作
        </Menu.Trigger>
        <Popup>
          <ActionItem label="新建文件" />
          <ActionItem label="打开文件" />
          <ActionItem label="保存文件" />
          <ActionItem label="删除文件" variant="danger" />
        </Popup>
      </Menu>
    </div>
  );
}
