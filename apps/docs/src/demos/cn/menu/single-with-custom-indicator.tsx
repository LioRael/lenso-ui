// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 single-with-custom-indicator, Apache-2.0.
import { useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { Button, Menu, MenuItem } from "@lenso/ui";
import { Popup, styles } from "../../en/menu/_shared";
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
    <Menu.RadioItem key={value} value={value} closeOnClick>
      <Menu.RadioItemIndicator keepMounted xstyle={styles.selectionIndicator}>
        {customCheckmarkIcon}
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
