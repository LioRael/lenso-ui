"use client";

// Adapted from HeroUI v3.2.6 with-descriptions, Apache-2.0.
import { FloppyDisk, FolderOpen, SquarePlus, TrashBin } from "@gravity-ui/icons";
import * as stylex from "@stylexjs/stylex";
import { Button, Menu } from "@lenso/ui";
import { ActionItem, Popup, Shortcut, styles } from "./_shared";

export function WithDescriptions() {
  return (
    <Menu>
      <Menu.Trigger render={<Button aria-label="Menu" variant="secondary" />}>Actions</Menu.Trigger>
      <Popup>
        <ActionItem
          label="New file"
          description="Create a new file"
          icon={<SquarePlus {...stylex.props(styles.icon)} />}
          shortcut={<Shortcut letter="N" />}
          onClick={() => console.log("Selected: new-file")}
        />
        <ActionItem
          label="Open file"
          description="Open an existing file"
          icon={<FolderOpen {...stylex.props(styles.icon)} />}
          shortcut={<Shortcut letter="O" />}
          onClick={() => console.log("Selected: open-file")}
        />
        <ActionItem
          label="Save file"
          description="Save the current file"
          icon={<FloppyDisk {...stylex.props(styles.icon)} />}
          shortcut={<Shortcut letter="S" />}
          onClick={() => console.log("Selected: save-file")}
        />
        <ActionItem
          label="Delete file"
          description="Move to trash"
          variant="danger"
          icon={<TrashBin {...stylex.props(styles.dangerIcon)} />}
          shortcut={<Shortcut letter="D" shift />}
          onClick={() => console.log("Selected: delete-file")}
        />
      </Popup>
    </Menu>
  );
}
