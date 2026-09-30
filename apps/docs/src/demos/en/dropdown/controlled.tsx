"use client";

// Adapted from HeroUI v3.2.6 controlled, Apache-2.0.
import { useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { Button, Dropdown, MenuItem } from "@lenso/ui";
import { Checkmark, Popup, styles } from "./_shared";

export function Controlled() {
  const [selected, setSelected] = useState(new Set(["bold"]));
  const [open, setOpen] = useState(false);
  const selectedItems = Array.from(selected);
  return (
    <div {...stylex.props(styles.controlled)}>
      <p {...stylex.props(styles.status)}>
        Selected: {selectedItems.length > 0 ? selectedItems.join(", ") : "None"}
      </p>
      <Dropdown open={open} onOpenChange={setOpen}>
        <Dropdown.Trigger render={<Button aria-label="Menu" variant="secondary" />}>
          Actions
        </Dropdown.Trigger>
        <Popup>
          {(["bold", "italic", "underline"] as const).map((value) => (
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
              <MenuItem.Label>{value.charAt(0).toUpperCase() + value.slice(1)}</MenuItem.Label>
              <Dropdown.CheckboxItemIndicator keepMounted xstyle={styles.selectionIndicator}>
                <Checkmark />
              </Dropdown.CheckboxItemIndicator>
            </Dropdown.CheckboxItem>
          ))}
        </Popup>
      </Dropdown>
    </div>
  );
}
