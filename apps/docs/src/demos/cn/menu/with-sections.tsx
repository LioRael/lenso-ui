"use client";

import { EllipsisVertical, Pencil, SquarePlus, TrashBin } from "@gravity-ui/icons";
import * as stylex from "@stylexjs/stylex";
import { GlassButton, Menu } from "@lenso/ui";
import { ActionItem, Popup, Shortcut, styles } from "../../en/menu/_shared";
export function WithSections() {
  return (
    <Menu>
      <Menu.Trigger render={<GlassButton isIconOnly aria-label="菜单" variant="default" />}>
        <EllipsisVertical />
      </Menu.Trigger>
      <Popup>
        <Menu.Group>
          <Menu.Group.Label>操作</Menu.Group.Label>
          <ActionItem
            label="新建文件"
            description="创建新文件"
            icon={<SquarePlus {...stylex.props(styles.icon)} />}
            shortcut={<Shortcut letter="N" />}
            onClick={() => console.log("Selected: new-file")}
          />
          <ActionItem
            label="编辑文件"
            description="进行修改"
            icon={<Pencil {...stylex.props(styles.icon)} />}
            shortcut={<Shortcut letter="E" />}
            onClick={() => console.log("Selected: edit-file")}
          />
        </Menu.Group>
        <Menu.Separator />
        <Menu.Group>
          <Menu.Group.Label>危险区域</Menu.Group.Label>
          <ActionItem
            label="删除文件"
            description="移至废纸篓"
            variant="danger"
            icon={<TrashBin {...stylex.props(styles.dangerIcon)} />}
            shortcut={<Shortcut letter="D" shift />}
            onClick={() => console.log("Selected: delete-file")}
          />
        </Menu.Group>
      </Popup>
    </Menu>
  );
}
