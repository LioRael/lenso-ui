// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 dropdown-default (Apache-2.0).
import { Button, Menu } from "@lenso/ui";
import { ActionItem, Popup } from "../../en/menu/_shared";
export function Default() {
  return (
    <Menu>
      <Menu.Trigger render={<Button aria-label="菜单" variant="secondary" />}>操作</Menu.Trigger>
      <Popup>
        <ActionItem label="新建文件" onClick={() => console.log("Selected: new-file")} />
        <ActionItem label="复制链接" onClick={() => console.log("Selected: copy-link")} />
        <ActionItem label="编辑文件" onClick={() => console.log("Selected: edit-file")} />
        <ActionItem
          label="删除文件"
          variant="danger"
          onClick={() => console.log("Selected: delete-file")}
        />
      </Popup>
    </Menu>
  );
}
