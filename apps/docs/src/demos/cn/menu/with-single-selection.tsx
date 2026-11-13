"use client";

import { useState } from "react";
import { GlassButton, Menu } from "@lenso/ui";
import { Checkmark, Popup, styles } from "../../en/menu/_shared";
export function WithSingleSelection() {
  const [selected, setSelected] = useState("apple");
  const fruit = (value: string, label: string) => (
    <Menu.RadioItem key={value} value={value} closeOnSelect>
      <Menu.ItemIndicator keepMounted xstyle={styles.selectionIndicator}>
        <Checkmark />
      </Menu.ItemIndicator>
      <Menu.Item.Label>{label}</Menu.Item.Label>
    </Menu.RadioItem>
  );
  return (
    <Menu>
      <Menu.Trigger render={<GlassButton aria-label="菜单" variant="default" />}>水果</Menu.Trigger>
      <Popup xstyle={styles.wide}>
        <Menu.RadioGroup value={selected} onValueChange={setSelected}>
          <Menu.Group>
            <Menu.Group.Label>选择水果</Menu.Group.Label>
            {fruit("apple", "Apple")}
            {fruit("banana", "Banana")}
            {fruit("cherry", "Cherry")}
          </Menu.Group>
          {fruit("orange", "Orange")}
          {fruit("pear", "Pear")}
        </Menu.RadioGroup>
      </Popup>
    </Menu>
  );
}
