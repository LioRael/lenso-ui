"use client";

import * as stylex from "@stylexjs/stylex";
import { Pencil, SquarePlus, TrashBin } from "@gravity-ui/icons";
import { ListBox, Kbd, Separator } from "@lenso/ui";
import { Description, Label } from "../../en/list-box/text";
import { styles } from "../../en/list-box/users";
const actionStyles = stylex.create({
  list: {
    width: "100%",
    padding: 8,
  },
  shortcut: {
    marginInlineStart: "auto",
  },
  header: {
    fontSize: 12,
    color: "var(--lenso-label-secondary)",
    padding: 8,
  },
  iconBox: {
    display: "flex",
    height: 32,
    alignItems: "flex-start",
    justifyContent: "center",
    paddingTop: 1,
    color: "var(--lenso-label-secondary)",
  },
  icon: {
    width: 16,
    height: 16,
    flexShrink: 0,
  },
});
export function Actions({ disabled = false }: { disabled?: boolean }) {
  const item = (
    key: string,
    name: string,
    description: string,
    shortcut: string,
    icon: React.ReactNode,
  ) => (
    <ListBox.Item
      itemKey={key}
      textValue={name}
      variant={key === "delete-file" ? "danger" : "default"}
    >
      <div {...stylex.props(actionStyles.iconBox)} aria-hidden="true">
        {icon}
      </div>
      <div {...stylex.props(styles.details)}>
        <Label>{name}</Label>
        <Description>{description}</Description>
      </div>
      <Kbd variant="light" xstyle={actionStyles.shortcut}>
        <Kbd.Abbr keyValue="command" />
        {key === "delete-file" && <Kbd.Abbr keyValue="shift" />}
        <Kbd.Content>{shortcut}</Kbd.Content>
      </Kbd>
    </ListBox.Item>
  );
  return (
    <div {...stylex.props(styles.surface)}>
      <ListBox
        aria-label="文件操作"
        xstyle={actionStyles.list}
        selectionMode="none"
        disabledKeys={disabled ? new Set(["delete-file"]) : undefined}
        onAction={(key) => alert(`Selected item: ${String(key)}`)}
      >
        <ListBox.Section aria-label="操作">
          <ListBox.SectionLabel>操作</ListBox.SectionLabel>
          {item(
            "new-file",
            "New file",
            "Create a new file",
            "N",
            <SquarePlus {...stylex.props(actionStyles.icon)} />,
          )}
          {item(
            "edit-file",
            "Edit file",
            "Make changes",
            "E",
            <Pencil {...stylex.props(actionStyles.icon)} />,
          )}
        </ListBox.Section>
        <Separator aria-hidden="true" />
        <ListBox.Section aria-label="危险区域">
          <ListBox.SectionLabel>危险区域</ListBox.SectionLabel>
          {item(
            "delete-file",
            "Delete file",
            "Move to trash",
            "D",
            <TrashBin {...stylex.props(actionStyles.icon)} />,
          )}
        </ListBox.Section>
      </ListBox>
    </div>
  );
}
