"use client";

import { useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { GlassButton, Menu } from "@lenso/ui";
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
      <Menu open={open} onOpenChange={setOpen}>
        <Menu.Trigger render={<GlassButton aria-label="Menu" variant="default" />}>
          Actions
        </Menu.Trigger>
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
              <Menu.Item.Label>{value.charAt(0).toUpperCase() + value.slice(1)}</Menu.Item.Label>
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
