"use client";

// Adapted from HeroUI v3.2.6 single-with-custom-indicator, Apache-2.0.
import { useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { Button, Dropdown, MenuItem } from "@lenso/ui";
import { Popup, styles } from "./_shared";

export function SingleWithCustomIndicator() {
  const [selected, setSelected] = useState("apple");
  const customCheckmarkIcon = (
    <svg
      height="16"
      viewBox="0 0 16 16"
      width="16"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        {...stylex.props(styles.accent)}
        clipRule="evenodd"
        d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14m3.1-8.55a.75.75 0 1 0-1.2-.9L7.419 8.858L6.03 7.47a.75.75 0 0 0-1.06 1.06l2 2a.75.75 0 0 0 1.13-.08z"
        fill="currentColor"
        fillRule="evenodd"
      />
    </svg>
  );
  const fruit = (value: string, label: string) => (
    <Dropdown.RadioItem key={value} value={value} closeOnClick>
      <Dropdown.RadioItemIndicator keepMounted xstyle={styles.selectionIndicator}>
        {customCheckmarkIcon}
      </Dropdown.RadioItemIndicator>
      <MenuItem.Label>{label}</MenuItem.Label>
    </Dropdown.RadioItem>
  );
  return (
    <Dropdown>
      <Dropdown.Trigger render={<Button aria-label="Menu" variant="secondary" />}>
        Fruits
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
