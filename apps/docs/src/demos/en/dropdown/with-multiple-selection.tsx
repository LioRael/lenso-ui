"use client";

// Adapted from HeroUI v3.2.6 with-multiple-selection, Apache-2.0.
import { useState } from "react";
import { Button, Dropdown, MenuItem } from "@lenso/ui";
import { Checkmark, Popup, styles } from "./_shared";

export function WithMultipleSelection() {
  const [selected, setSelected] = useState(new Set(["apple"]));
  const [open, setOpen] = useState(false);
  const fruit = (value: string, label: string) => (
    <Dropdown.CheckboxItem
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
      <Dropdown.CheckboxItemIndicator keepMounted xstyle={styles.selectionIndicator}>
        <Checkmark />
      </Dropdown.CheckboxItemIndicator>
      <MenuItem.Label>{label}</MenuItem.Label>
    </Dropdown.CheckboxItem>
  );
  return (
    <Dropdown open={open} onOpenChange={setOpen}>
      <Dropdown.Trigger render={<Button aria-label="Menu" variant="secondary" />}>
        Preferred Fruits
      </Dropdown.Trigger>
      <Popup xstyle={styles.wide}>
        <Dropdown.Section>
          <Dropdown.Section.Label>Select a fruit</Dropdown.Section.Label>
          {fruit("apple", "Apple")}
          {fruit("banana", "Banana")}
          {fruit("cherry", "Cherry")}
        </Dropdown.Section>
        {fruit("orange", "Orange")}
        {fruit("pear", "Pear")}
      </Popup>
    </Dropdown>
  );
}
