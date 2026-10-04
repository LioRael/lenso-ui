// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 with-multiple-selection, Apache-2.0.
import { useState } from "react";
import { Button, Menu, MenuItem } from "@lenso/ui";
import { Checkmark, Popup, styles } from "../../en/menu/_shared";
export function WithMultipleSelection() {
  const [selected, setSelected] = useState(new Set(["apple"]));
  const [open, setOpen] = useState(false);
  const fruit = (value: string, label: string) => (
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
      <Menu.CheckboxItemIndicator keepMounted xstyle={styles.selectionIndicator}>
        <Checkmark />
      </Menu.CheckboxItemIndicator>
      <MenuItem.Label>{label}</MenuItem.Label>
    </Menu.CheckboxItem>
  );
  return (
    <Menu open={open} onOpenChange={setOpen}>
      <Menu.Trigger render={<Button aria-label="菜单" variant="secondary" />}>
        喜爱的水果
      </Menu.Trigger>
      <Popup xstyle={styles.wide}>
        <Menu.Section>
          <Menu.Section.Label>选择水果</Menu.Section.Label>
          {fruit("apple", "Apple")}
          {fruit("banana", "Banana")}
          {fruit("cherry", "Cherry")}
        </Menu.Section>
        {fruit("orange", "Orange")}
        {fruit("pear", "Pear")}
      </Popup>
    </Menu>
  );
}
