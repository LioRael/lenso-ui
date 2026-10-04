// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 controlled-open-state, Apache-2.0.
import { useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { Button, Menu } from "@lenso/ui";
import { ActionItem, Popup, styles } from "../../en/menu/_shared";
export function ControlledOpenState() {
  const [open, setOpen] = useState(false);
  return (
    <div {...stylex.props(styles.controlled)}>
      <p {...stylex.props(styles.status)}>
        Menu is: <strong>{open ? "打开" : "关闭"}</strong>
      </p>
      <Menu open={open} onOpenChange={setOpen}>
        <Menu.Trigger render={<Button aria-label="菜单" variant="secondary" />}>操作</Menu.Trigger>
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
