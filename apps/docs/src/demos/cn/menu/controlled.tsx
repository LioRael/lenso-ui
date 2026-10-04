// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 controlled, Apache-2.0.
import { useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { Button, Menu, MenuItem } from "@lenso/ui";
import { Checkmark, Popup, styles } from "../../en/menu/_shared";
export function Controlled() {
  const [selected, setSelected] = useState(new Set(["bold"]));
  const [open, setOpen] = useState(false);
  const selectedItems = Array.from(selected);
  return (
    <div {...stylex.props(styles.controlled)}>
      <p {...stylex.props(styles.status)}>
        已选：{selectedItems.length > 0 ? selectedItems.join(", ") : "无"}
      </p>
      <Menu open={open} onOpenChange={setOpen}>
        <Menu.Trigger render={<Button aria-label="菜单" variant="secondary" />}>操作</Menu.Trigger>
        <Popup>
          {(["bold", "italic", "underline"] as const).map((value) => (
            <Menu.CheckboxItem
              key={value}
              checked={selected.has(value)}
              closeOnClick={false}
              onKeyDown={(event) => {
                if (event.key === "Enter") setOpen(false);
              }}
              onCheckedChange={(checked) =>
                setSelected((previous) => {
                  const next = new Set(previous);
                  if (checked) next.add(value);
                  else next.delete(value);
                  return next;
                })
              }
            >
              <MenuItem.Label>{value.charAt(0).toUpperCase() + value.slice(1)}</MenuItem.Label>
              <Menu.CheckboxItemIndicator keepMounted xstyle={styles.selectionIndicator}>
                <Checkmark />
              </Menu.CheckboxItemIndicator>
            </Menu.CheckboxItem>
          ))}
        </Popup>
      </Menu>
    </div>
  );
}
