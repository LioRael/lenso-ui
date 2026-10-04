// Generated source-backed helper adaptation from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Shared content from the pinned HeroUI v3.2.6 list-box examples (Apache-2.0).
import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { Check } from "@gravity-ui/icons";
import { Avatar, ListBox, ListBoxItem } from "@lenso/ui";
import { Description, Label } from "../../en/list-box/text";
export const styles = stylex.create({
  list: {
    width: 220,
  },
  surface: {
    width: 256,
    borderRadius: 24,
    backgroundColor: "var(--surface)",
    boxShadow: "var(--surface-shadow)",
  },
  details: {
    display: "flex",
    flexDirection: "column",
  },
  stack: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  muted: {
    fontSize: 14,
    color: "var(--muted)",
  },
  check: {
    width: 16,
    height: 16,
    color: "var(--accent-soft-foreground)",
  },
  custom: {
    width: 224,
    borderRadius: 12,
    border: "1px solid color-mix(in oklch, var(--border) 80%, transparent)",
    backgroundColor: "var(--surface)",
    padding: 4,
    boxShadow: "0 1px 2px #0000000d",
  },
  customItem: {
    borderRadius: 8,
    backgroundColor: {
      default: "transparent",
      ":focus": "color-mix(in oklch, var(--accent) 10%, transparent)",
      ":is([aria-selected=true])": "color-mix(in oklch, var(--accent) 5%, transparent)",
    },
  },
});
const users = [
  {
    key: "1",
    name: "Bob",
    color: "blue",
  },
  {
    key: "2",
    name: "Fred",
    color: "green",
  },
  {
    key: "3",
    name: "Martha",
    color: "purple",
  },
];
export function UserItems({
  customCheck = false,
  customStyles = false,
  renderItems = false,
  count = 3,
}: {
  customCheck?: boolean;
  customStyles?: boolean;
  renderItems?: boolean;
  count?: number;
}) {
  return users.slice(0, count).map((user, index) => (
    <ListBoxItem
      key={user.key}
      itemKey={user.key}
      textValue={user.name}
      xstyle={customStyles && styles.customItem}
      render={
        renderItems
          ? (props) => <span {...props} data-custom={["foo", "bar", "baz"][index]} />
          : undefined
      }
    >
      <Avatar size="sm">
        <Avatar.Image
          alt={user.name}
          src={`https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/${user.color}.jpg`}
        />
        <Avatar.Fallback>{user.name[0]}</Avatar.Fallback>
      </Avatar>
      <div {...stylex.props(styles.details)}>
        <Label>{user.name}</Label>
        <Description>{user.name.toLowerCase()}@heroui.com</Description>
      </div>
      <ListBoxItem.Indicator>
        {customCheck
          ? ({ isSelected }) =>
              isSelected ? <Check {...stylex.props(styles.check)} aria-hidden="true" /> : null
          : undefined}
      </ListBoxItem.Indicator>
    </ListBoxItem>
  ));
}
export function UsersList(
  props: Omit<React.ComponentProps<typeof ListBox>, "children"> &
    React.ComponentProps<typeof UserItems>,
) {
  const { customCheck, customStyles, renderItems, count, ...root } = props;
  return (
    <ListBox aria-label="用户" {...root}>
      <UserItems
        customCheck={customCheck}
        customStyles={customStyles}
        renderItems={renderItems}
        count={count}
      />
    </ListBox>
  );
}
