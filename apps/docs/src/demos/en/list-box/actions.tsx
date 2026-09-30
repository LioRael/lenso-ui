"use client";
// Content from HeroUI v3.2.6 section examples (Apache-2.0).
import * as stylex from "@stylexjs/stylex";
import { Pencil, SquarePlus, TrashBin } from "@gravity-ui/icons";
import { Header, Kbd, ListBox, ListBoxItem, ListBoxSection, Separator } from "@lenso/ui";
import { Description, Label } from "./text";
import { styles } from "./users";
const actionStyles = stylex.create({
  list: { width: "100%", padding: 8 },
  shortcut: { marginInlineStart: "auto" },
  header: { fontSize: 12, color: "var(--muted)", padding: 8 },
  iconBox: {
    display: "flex",
    height: 32,
    alignItems: "flex-start",
    justifyContent: "center",
    paddingTop: 1,
    color: "var(--muted)",
  },
  icon: { width: 16, height: 16, flexShrink: 0 },
});
export function Actions({ disabled = false }: { disabled?: boolean }) {
  const item = (
    key: string,
    name: string,
    description: string,
    shortcut: string,
    icon: React.ReactNode,
  ) => (
    <ListBoxItem
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
    </ListBoxItem>
  );
  return (
    <div {...stylex.props(styles.surface)}>
      <ListBox
        aria-label="File actions"
        xstyle={actionStyles.list}
        selectionMode="none"
        disabledKeys={disabled ? new Set(["delete-file"]) : undefined}
        onAction={(key) => alert(`Selected item: ${String(key)}`)}
      >
        <ListBoxSection aria-label="Actions">
          <Header>Actions</Header>
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
        </ListBoxSection>
        <Separator />
        <ListBoxSection aria-label="Danger zone">
          <Header>Danger zone</Header>
          {item(
            "delete-file",
            "Delete file",
            "Move to trash",
            "D",
            <TrashBin {...stylex.props(actionStyles.icon)} />,
          )}
        </ListBoxSection>
      </ListBox>
    </div>
  );
}
