"use client";
import { usePlaygroundLog } from "../../shared/playground-log";

import { GlassButton, Menu } from "@lenso/ui";
import { ActionItem, Popup, Shortcut } from "./_shared";

export function WithKeyboardShortcuts() {
  const log = usePlaygroundLog();
  return (
    <Menu>
      <Menu.Trigger render={<GlassButton aria-label="Menu" variant="default" />}>
        Actions
      </Menu.Trigger>
      <Popup>
        <ActionItem
          label="New"
          shortcut={<Shortcut letter="N" />}
          onClick={() => log("Selected: new")}
        />
        <ActionItem
          label="Open"
          shortcut={<Shortcut letter="O" />}
          onClick={() => log("Selected: open")}
        />
        <ActionItem
          label="Save"
          shortcut={<Shortcut letter="S" />}
          onClick={() => log("Selected: save")}
        />
        <ActionItem
          label="Delete"
          variant="danger"
          shortcut={<Shortcut letter="D" shift />}
          onClick={() => log("Selected: delete")}
        />
      </Popup>
    </Menu>
  );
}
