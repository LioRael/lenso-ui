"use client";
import { usePlaygroundLog } from "../../shared/playground-log";

import { EllipsisVertical, Pencil, SquarePlus, TrashBin } from "@gravity-ui/icons";
import * as stylex from "@stylexjs/stylex";
import { GlassButton, Menu } from "@lenso/ui";
import { ActionItem, Popup, Shortcut, styles } from "./_shared";

export function WithSections() {
  const log = usePlaygroundLog();
  return (
    <Menu>
      <Menu.Trigger render={<GlassButton isIconOnly aria-label="Menu" variant="default" />}>
        <EllipsisVertical />
      </Menu.Trigger>
      <Popup>
        <Menu.Group>
          <Menu.Group.Label>Actions</Menu.Group.Label>
          <ActionItem
            label="New file"
            description="Create a new file"
            icon={<SquarePlus {...stylex.props(styles.icon)} />}
            shortcut={<Shortcut letter="N" />}
            onClick={() => log("Selected: new-file")}
          />
          <ActionItem
            label="Edit file"
            description="Make changes"
            icon={<Pencil {...stylex.props(styles.icon)} />}
            shortcut={<Shortcut letter="E" />}
            onClick={() => log("Selected: edit-file")}
          />
        </Menu.Group>
        <Menu.Separator />
        <Menu.Group>
          <Menu.Group.Label>Danger zone</Menu.Group.Label>
          <ActionItem
            label="Delete file"
            description="Move to trash"
            variant="danger"
            icon={<TrashBin {...stylex.props(styles.dangerIcon)} />}
            shortcut={<Shortcut letter="D" shift />}
            onClick={() => log("Selected: delete-file")}
          />
        </Menu.Group>
      </Popup>
    </Menu>
  );
}
