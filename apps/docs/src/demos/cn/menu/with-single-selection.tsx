// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 with-single-selection, Apache-2.0.
import { useState } from "react";
import { Button, Menu, MenuItem } from "@lenso/ui";
import { Checkmark, Popup, styles } from "../../en/menu/_shared";
export function WithSingleSelection() {
  const [selected, setSelected] = useState("apple");
  const fruit = (value: string, label: string) => (
    <Menu.RadioItem key={value} value={value} closeOnClick>
      <Menu.RadioItemIndicator keepMounted xstyle={styles.selectionIndicator}>
        <Checkmark />
      </Menu.RadioItemIndicator>
      <MenuItem.Label>{label}</MenuItem.Label>
    </Menu.RadioItem>
  );
  return (
    <Menu>
      <Menu.Trigger render={<Button aria-label="菜单" variant="secondary" />}>水果</Menu.Trigger>
      <Popup xstyle={styles.wide}>
        <Menu.RadioGroup value={selected} onValueChange={setSelected}>
          <Menu.Section>
            <Menu.Section.Label>选择水果</Menu.Section.Label>
            {fruit("apple", "Apple")}
            {fruit("banana", "Banana")}
            {fruit("cherry", "Cherry")}
          </Menu.Section>
          {fruit("orange", "Orange")}
          {fruit("pear", "Pear")}
        </Menu.RadioGroup>
      </Popup>
    </Menu>
  );
}
