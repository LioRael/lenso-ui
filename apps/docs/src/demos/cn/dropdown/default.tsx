// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 dropdown-default (Apache-2.0).
import * as stylex from "@stylexjs/stylex";
import { labelStyles } from "@lenso/tokens/label";
import { Button, Dropdown } from "@lenso/ui";
export function Default() {
  return (
    <Dropdown>
      <Dropdown.Trigger render={<Button aria-label="菜单" variant="secondary" />}>
        操作
      </Dropdown.Trigger>
      <Dropdown.Portal>
        <Dropdown.Positioner>
          <Dropdown.Popup>
            {["新建文件", "复制链接", "编辑文件", "删除文件"].map((label) => (
              <Dropdown.Item key={label} onClick={() => console.log(`Selected: ${label}`)}>
                <span {...stylex.props(labelStyles.label)}>{label}</span>
              </Dropdown.Item>
            ))}
          </Dropdown.Popup>
        </Dropdown.Positioner>
      </Dropdown.Portal>
    </Dropdown>
  );
}
