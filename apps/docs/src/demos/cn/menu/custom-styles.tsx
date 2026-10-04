// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 custom-styles, Apache-2.0.
import { Button, Menu } from "@lenso/ui";
import { ActionItem, Popup, styles } from "../../en/menu/_shared";
export function CustomStyles() {
  return (
    <Menu>
      <Menu.Trigger render={<Button variant="secondary" />}>操作</Menu.Trigger>
      <Popup xstyle={styles.customPopup}>
        <ActionItem label="重命名" xstyle={styles.customItem} />
        <ActionItem label="复制" xstyle={styles.customItem} />
        <ActionItem label="删除" variant="danger" xstyle={styles.customDangerItem} />
      </Popup>
    </Menu>
  );
}
