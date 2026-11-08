"use client";

import { GlassButton, Menu } from "@lenso/ui";
import { ActionItem, Popup, Shortcut } from "../../en/menu/_shared";
export function WithKeyboardShortcuts() {
  return (
    <Menu>
      <Menu.Trigger render={<GlassButton aria-label="菜单" variant="default" />}>操作</Menu.Trigger>
      <Popup>
        <ActionItem
          label="新建"
          shortcut={<Shortcut letter="N" />}
          onClick={() => console.log("Selected: new")}
        />
        <ActionItem
          label="打开"
          shortcut={<Shortcut letter="O" />}
          onClick={() => console.log("Selected: open")}
        />
        <ActionItem
          label="保存"
          shortcut={<Shortcut letter="S" />}
          onClick={() => console.log("Selected: save")}
        />
        <ActionItem
          label="删除"
          variant="danger"
          shortcut={<Shortcut letter="D" shift />}
          onClick={() => console.log("Selected: delete")}
        />
      </Popup>
    </Menu>
  );
}
