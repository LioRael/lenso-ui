// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 with-disabled-items, Apache-2.0.
import { Bars, Pencil, SquarePlus, TrashBin } from "@gravity-ui/icons";
import * as stylex from "@stylexjs/stylex";
import { Button, Menu } from "@lenso/ui";
import { ActionItem, Popup, Shortcut, styles } from "../../en/menu/_shared";
export function WithDisabledItems() {
  return (
    <Menu>
      <Menu.Trigger render={<Button isIconOnly aria-label="菜单" variant="secondary" />}>
        <Bars />
      </Menu.Trigger>
      <Popup xstyle={styles.disabledWidth}>
        <Menu.Section>
          <Menu.Section.Label>操作</Menu.Section.Label>
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
        </Menu.Section>
        <Menu.Separator />
        <Menu.Section>
          <Menu.Section.Label>危险区域</Menu.Section.Label>
          <ActionItem
            disabled
            label="删除文件"
            description="移至废纸篓"
            variant="danger"
            icon={<TrashBin {...stylex.props(styles.dangerIcon)} />}
            shortcut={<Shortcut letter="D" shift />}
            onClick={() => console.log("Selected: delete-file")}
          />
        </Menu.Section>
      </Popup>
    </Menu>
  );
}
