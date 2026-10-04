"use client";

// Adapted from HeroUI v3.2.6 with-disabled-items, Apache-2.0.
import { Bars, Pencil, SquarePlus, TrashBin } from "@gravity-ui/icons";
import * as stylex from "@stylexjs/stylex";
import { Button, Menu } from "@lenso/ui";
import { ActionItem, Popup, Shortcut, styles } from "./_shared";

export function WithDisabledItems() {
  return (
    <Menu>
      <Menu.Trigger render={<Button isIconOnly aria-label="Menu" variant="secondary" />}>
        <Bars />
      </Menu.Trigger>
      <Popup xstyle={styles.disabledWidth}>
        <Menu.Section>
          <Menu.Section.Label>Actions</Menu.Section.Label>
          <ActionItem
            label="New file"
            description="Create a new file"
            icon={<SquarePlus {...stylex.props(styles.icon)} />}
            shortcut={<Shortcut letter="N" />}
            onClick={() => console.log("Selected: new-file")}
          />
          <ActionItem
            label="Edit file"
            description="Make changes"
            icon={<Pencil {...stylex.props(styles.icon)} />}
            shortcut={<Shortcut letter="E" />}
            onClick={() => console.log("Selected: edit-file")}
          />
        </Menu.Section>
        <Menu.Separator />
        <Menu.Section>
          <Menu.Section.Label>Danger zone</Menu.Section.Label>
          <ActionItem
            disabled
            label="Delete file"
            description="Move to trash"
            variant="danger"
            icon={<TrashBin {...stylex.props(styles.dangerIcon)} />}
            shortcut={<Shortcut letter="D" shift />}
            onClick={() => console.log("Selected: delete-file")}
          />
        </Menu.Section>
      </Popup>
    </Menu>
  );
}
