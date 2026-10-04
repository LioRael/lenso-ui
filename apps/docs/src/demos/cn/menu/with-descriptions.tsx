// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 with-descriptions, Apache-2.0.
import { FloppyDisk, FolderOpen, SquarePlus, TrashBin } from "@gravity-ui/icons";
import * as stylex from "@stylexjs/stylex";
import { Button, Menu } from "@lenso/ui";
import { ActionItem, Popup, Shortcut, styles } from "../../en/menu/_shared";
export function WithDescriptions() {
  return (
    <Menu>
      <Menu.Trigger render={<Button aria-label="菜单" variant="secondary" />}>操作</Menu.Trigger>
      <Popup>
        <ActionItem
          label="新建文件"
          description="创建新文件"
          icon={<SquarePlus {...stylex.props(styles.icon)} />}
          shortcut={<Shortcut letter="N" />}
          onClick={() => console.log("Selected: new-file")}
        />
        <ActionItem
          label="打开文件"
          description="打开已有文件"
          icon={<FolderOpen {...stylex.props(styles.icon)} />}
          shortcut={<Shortcut letter="O" />}
          onClick={() => console.log("Selected: open-file")}
        />
        <ActionItem
          label="保存文件"
          description="保存当前文件"
          icon={<FloppyDisk {...stylex.props(styles.icon)} />}
          shortcut={<Shortcut letter="S" />}
          onClick={() => console.log("Selected: save-file")}
        />
        <ActionItem
          label="删除文件"
          description="移至废纸篓"
          variant="danger"
          icon={<TrashBin {...stylex.props(styles.dangerIcon)} />}
          shortcut={<Shortcut letter="D" shift />}
          onClick={() => console.log("Selected: delete-file")}
        />
      </Popup>
    </Menu>
  );
}
