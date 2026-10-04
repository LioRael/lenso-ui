"use client";

// Adapted from HeroUI v3.2.6 with-keyboard-shortcuts, Apache-2.0.
import { Button, Menu } from "@lenso/ui";
import { ActionItem, Popup, Shortcut } from "./_shared";

export function WithKeyboardShortcuts() {
  return (
    <Menu>
      <Menu.Trigger render={<Button aria-label="Menu" variant="secondary" />}>Actions</Menu.Trigger>
      <Popup>
        <ActionItem
          label="New"
          shortcut={<Shortcut letter="N" />}
          onClick={() => console.log("Selected: new")}
        />
        <ActionItem
          label="Open"
          shortcut={<Shortcut letter="O" />}
          onClick={() => console.log("Selected: open")}
        />
        <ActionItem
          label="Save"
          shortcut={<Shortcut letter="S" />}
          onClick={() => console.log("Selected: save")}
        />
        <ActionItem
          label="Delete"
          variant="danger"
          shortcut={<Shortcut letter="D" shift />}
          onClick={() => console.log("Selected: delete")}
        />
      </Popup>
    </Menu>
  );
}
