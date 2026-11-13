"use client";
import { useState } from "react";
import { usePlaygroundLog } from "../../shared/playground-log";
import { FloppyDisk, FolderOpen, SquarePlus, TrashBin } from "@gravity-ui/icons";
import { GlassButton, Menu, IconChevronRight } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const s = stylex.create({
  root: { display: "flex", flexDirection: "column", alignItems: "center", gap: 16 },
});
export function Default() {
  const log = usePlaygroundLog();
  const [pinned, setPinned] = useState(false);
  return (
    <div {...stylex.props(s.root)}>
      <Menu>
        <Menu.Trigger render={<GlassButton aria-label="Menu" variant="default" />}>
          Actions
        </Menu.Trigger>
        <Menu.Content aria-label="File actions">
          <Menu.ActionGroup aria-label="Quick actions">
            <Menu.Action onClick={() => log("Created")}>
              <SquarePlus width={17} height={22} aria-hidden="true" />
              New
            </Menu.Action>
            <Menu.Action onClick={() => log("Saved")}>
              <FloppyDisk width={17} height={22} aria-hidden="true" />
              Save
            </Menu.Action>
            <Menu.Action variant="danger" onClick={() => log("Deleted")}>
              <TrashBin width={17} height={22} aria-hidden="true" />
              Delete
            </Menu.Action>
          </Menu.ActionGroup>
          <Menu.Separator />
          <Menu.Item onClick={() => log("Opened")}>
            <Menu.Item.Icon>
              <FolderOpen width={20} height={20} aria-hidden="true" />
            </Menu.Item.Icon>
            <Menu.Item.Label>Open file</Menu.Item.Label>
            <Menu.Item.Shortcut aria-hidden="true">⌘O</Menu.Item.Shortcut>
          </Menu.Item>
          <Menu.Item disabled>Move to folder</Menu.Item>
          <Menu.Item onClick={() => log("Details opened")}>
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
              closeOnSelect={false}
              value="default"
            >
              <Menu.ItemIndicator keepMounted>✓</Menu.ItemIndicator>Pin to favorites
            </Menu.CheckboxItem>
            <Menu.Sub>
              <Menu.SubTrigger>
                Sort by{" "}
                <Menu.Item.SubmenuIndicator>
                  <IconChevronRight width={14} height={20} />
                </Menu.Item.SubmenuIndicator>
              </Menu.SubTrigger>
              <Menu.SubContent>
                <Menu.RadioGroup defaultValue="name">
                  <Menu.RadioItem value="name">
                    <Menu.ItemIndicator>✓</Menu.ItemIndicator>Name
                  </Menu.RadioItem>
                  <Menu.RadioItem value="date">
                    <Menu.ItemIndicator>✓</Menu.ItemIndicator>Date modified
                  </Menu.RadioItem>
                </Menu.RadioGroup>
              </Menu.SubContent>
            </Menu.Sub>
          </Menu.Group>
        </Menu.Content>
      </Menu>
      <Menu>
        <Menu.Bar aria-label="Edit actions">
          <Menu.BarItem onClick={() => log("Cut")}>Cut</Menu.BarItem>
          <Menu.BarItem onClick={() => log("Copied")}>Copy</Menu.BarItem>
          <Menu.BarItem onClick={() => log("Pasted")}>Paste</Menu.BarItem>
          <Menu.ExpandTrigger />
        </Menu.Bar>
        <Menu.Content aria-label="More edit actions">
          <Menu.Item onClick={() => log("Selected all")}>Select All</Menu.Item>
          <Menu.Item onClick={() => log("Duplicated")}>Duplicate</Menu.Item>
          <Menu.Separator />
          <Menu.Item onClick={() => log("Shared")}>Share</Menu.Item>
        </Menu.Content>
      </Menu>
    </div>
  );
}
