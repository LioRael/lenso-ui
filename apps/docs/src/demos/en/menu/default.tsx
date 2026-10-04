"use client";

// Adapted from HeroUI v3.2.6 dropdown-default (Apache-2.0).
import { Button, Menu } from "@lenso/ui";
import { ActionItem, Popup } from "./_shared";

export function Default() {
  return (
    <Menu>
      <Menu.Trigger render={<Button aria-label="Menu" variant="secondary" />}>Actions</Menu.Trigger>
      <Popup>
        <ActionItem label="New file" onClick={() => console.log("Selected: new-file")} />
        <ActionItem label="Copy link" onClick={() => console.log("Selected: copy-link")} />
        <ActionItem label="Edit file" onClick={() => console.log("Selected: edit-file")} />
        <ActionItem
          label="Delete file"
          variant="danger"
          onClick={() => console.log("Selected: delete-file")}
        />
      </Popup>
    </Menu>
  );
}
