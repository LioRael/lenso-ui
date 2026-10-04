// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 with-keyboard-shortcuts, Apache-2.0.
import { Button, Menu } from "@lenso/ui";
import { ActionItem, Popup, Shortcut } from "../../en/menu/_shared";
export function WithKeyboardShortcuts() {
  return (
    <Menu>
      <Menu.Trigger render={<Button aria-label="菜单" variant="secondary" />}>操作</Menu.Trigger>
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
