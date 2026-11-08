"use client";

import { useState } from "react";
import { GlassButton, Menu } from "@lenso/ui";
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
      <Menu.Item.Label>{label}</Menu.Item.Label>
    </Menu.CheckboxItem>
  );
  return (
    <Menu open={open} onOpenChange={setOpen}>
      <Menu.Trigger render={<GlassButton aria-label="菜单" variant="default" />}>
        喜爱的水果
      </Menu.Trigger>
      <Popup xstyle={styles.wide}>
        <Menu.Group>
          <Menu.Group.Label>选择水果</Menu.Group.Label>
          {fruit("apple", "Apple")}
          {fruit("banana", "Banana")}
          {fruit("cherry", "Cherry")}
        </Menu.Group>
        {fruit("orange", "Orange")}
        {fruit("pear", "Pear")}
      </Popup>
    </Menu>
  );
}
