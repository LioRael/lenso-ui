"use client";
import { useState } from "react";
import { ChevronRight, FloppyDisk, FolderOpen, SquarePlus, TrashBin } from "@gravity-ui/icons";
import { Menu } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const s = stylex.create({
  root: { display: "flex", flexDirection: "column", alignItems: "center", gap: 16 },
  status: { fontSize: 13, color: "var(--lenso-label-secondary)", minHeight: 20 },
});
export function Default() {
  const [action, setAction] = useState(""),
    [pinned, setPinned] = useState(false);
  return (
    <div {...stylex.props(s.root)}>
      <Menu morphTrigger>
        <Menu.Trigger aria-label="Menu">Actions</Menu.Trigger>
        <Menu.Portal>
          <Menu.Positioner>
            <Menu.Popup aria-label="File actions">
              <Menu.ActionGroup aria-label="Quick actions">
                <Menu.Action onClick={() => setAction("Created")}>
                  <SquarePlus width={17} height={22} aria-hidden="true" />
                  New file
                </Menu.Action>
                <Menu.Action onClick={() => setAction("Saved")}>
                  <FloppyDisk width={17} height={22} aria-hidden="true" />
                  Save
                </Menu.Action>
                <Menu.Action variant="danger" onClick={() => setAction("Deleted")}>
                  <TrashBin width={17} height={22} aria-hidden="true" />
                  Delete
                </Menu.Action>
              </Menu.ActionGroup>
              <Menu.Separator />
              <Menu.Item onClick={() => setAction("Opened")}>
                <Menu.Item.Icon>
                  <FolderOpen width={20} height={20} aria-hidden="true" />
                </Menu.Item.Icon>
                <Menu.Item.Label>Open file</Menu.Item.Label>
                <Menu.Item.Shortcut aria-hidden="true">⌘O</Menu.Item.Shortcut>
              </Menu.Item>
              <Menu.Item disabled>Move to folder</Menu.Item>
              <Menu.Item onClick={() => setAction("Details opened")}>
                <Menu.Item.Content>
                  <Menu.Item.Label>File details</Menu.Item.Label>
                  <Menu.Item.Description>Size and permissions</Menu.Item.Description>
                </Menu.Item.Content>
              </Menu.Item>
              <Menu.Separator />
              <Menu.Group>
                <Menu.GroupLabel>Organization</Menu.GroupLabel>
                <Menu.CheckboxItem
                  checked={pinned}
                  onCheckedChange={setPinned}
                  closeOnClick={false}
                >
                  <Menu.CheckboxItemIndicator keepMounted>✓</Menu.CheckboxItemIndicator>Pin to
                  favorites
                </Menu.CheckboxItem>
                <Menu.SubmenuRoot>
                  <Menu.SubmenuTrigger>
                    Sort by{" "}
                    <Menu.Item.SubmenuIndicator>
                      <ChevronRight width={14} height={20} />
                    </Menu.Item.SubmenuIndicator>
                  </Menu.SubmenuTrigger>
                  <Menu.Portal>
                    <Menu.Positioner>
                      <Menu.Popup>
                        <Menu.RadioGroup defaultValue="name">
                          <Menu.RadioItem value="name">
                            <Menu.RadioItemIndicator>✓</Menu.RadioItemIndicator>Name
                          </Menu.RadioItem>
                          <Menu.RadioItem value="date">
                            <Menu.RadioItemIndicator>✓</Menu.RadioItemIndicator>Date modified
                          </Menu.RadioItem>
                        </Menu.RadioGroup>
                      </Menu.Popup>
                    </Menu.Positioner>
                  </Menu.Portal>
                </Menu.SubmenuRoot>
              </Menu.Group>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu>

      <output aria-live="polite" {...stylex.props(s.status)}>
        {action || (pinned ? "Pinned to favorites" : "Choose an action")}
      </output>
    </div>
  );
}
