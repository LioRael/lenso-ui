"use client";

// Adapted from HeroUI v3.2.6 with-single-selection, Apache-2.0.
import { useState } from "react";
import { Button, Dropdown, MenuItem } from "@lenso/ui";
import { Checkmark, Popup, styles } from "./_shared";

export function WithSingleSelection() {
  const [selected, setSelected] = useState("apple");
  const fruit = (value: string, label: string) => (
    <Dropdown.RadioItem key={value} value={value} closeOnClick>
      <Dropdown.RadioItemIndicator keepMounted xstyle={styles.selectionIndicator}>
        <Checkmark />
      </Dropdown.RadioItemIndicator>
      <MenuItem.Label>{label}</MenuItem.Label>
    </Dropdown.RadioItem>
  );
  return (
    <Dropdown>
      <Dropdown.Trigger render={<Button aria-label="Menu" variant="secondary" />}>
        Fruit
      </Dropdown.Trigger>
      <Popup xstyle={styles.wide}>
        <Dropdown.RadioGroup value={selected} onValueChange={setSelected}>
          <Dropdown.Section>
            <Dropdown.Section.Label>Select a fruit</Dropdown.Section.Label>
            {fruit("apple", "Apple")}
            {fruit("banana", "Banana")}
            {fruit("cherry", "Cherry")}
          </Dropdown.Section>
          {fruit("orange", "Orange")}
          {fruit("pear", "Pear")}
        </Dropdown.RadioGroup>
      </Popup>
    </Dropdown>
  );
}
