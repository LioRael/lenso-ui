"use client";
import { usePlaygroundLog } from "../../shared/playground-log";

import { FloppyDisk, FolderOpen, SquarePlus, TrashBin } from "@gravity-ui/icons";
import * as stylex from "@stylexjs/stylex";
import { GlassButton, Menu } from "@lenso/ui";
import { ActionItem, Popup, Shortcut, styles } from "./_shared";

export function WithIcons() {
  const log = usePlaygroundLog();
  return (
    <Menu>
      <Menu.Trigger render={<GlassButton aria-label="Menu" variant="default" />}>
        Actions
      </Menu.Trigger>
      <Popup>
        <ActionItem
          label="New file"
          icon={<SquarePlus {...stylex.props(styles.icon)} />}
          shortcut={<Shortcut letter="N" />}
          onClick={() => log("Selected: new-file")}
        />
        <ActionItem
          label="Open file"
          icon={<FolderOpen {...stylex.props(styles.icon)} />}
          shortcut={<Shortcut letter="O" />}
          onClick={() => log("Selected: open-file")}
        />
        <ActionItem
          label="Save file"
          icon={<FloppyDisk {...stylex.props(styles.icon)} />}
          shortcut={<Shortcut letter="S" />}
          onClick={() => log("Selected: save-file")}
        />
        <ActionItem
          label="Delete file"
          variant="danger"
          icon={<TrashBin {...stylex.props(styles.dangerIcon)} />}
          shortcut={<Shortcut letter="D" shift />}
          onClick={() => log("Selected: delete-file")}
        />
      </Popup>
    </Menu>
  );
}
