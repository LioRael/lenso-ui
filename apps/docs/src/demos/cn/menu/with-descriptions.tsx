"use client";

import { FloppyDisk, FolderOpen, SquarePlus, TrashBin } from "@gravity-ui/icons";
import * as stylex from "@stylexjs/stylex";
import { GlassButton, Menu } from "@lenso/ui";
import { ActionItem, Popup, Shortcut, styles } from "../../en/menu/_shared";
export function WithDescriptions() {
  return (
    <Menu>
      <Menu.Trigger render={<GlassButton aria-label="菜单" variant="default" />}>操作</Menu.Trigger>
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
