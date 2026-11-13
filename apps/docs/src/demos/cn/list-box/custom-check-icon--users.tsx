"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { Check } from "@gravity-ui/icons";
import { Avatar, ListBox, type ListBoxRootProps } from "@lenso/ui";
import { Description, Label } from "../../en/list-box/text";
export const styles = stylex.create({
  list: {
    width: 220,
  },
  surface: {
    width: 256,
    borderRadius: 24,
    backgroundColor: "var(--lenso-background-grouped-secondary)",
    boxShadow: "var(--lenso-surface-shadow)",
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
    color: "var(--lenso-label-secondary)",
  },
  check: {
    width: 16,
    height: 16,
    color: "var(--lenso-tint-text)",
  },
  custom: {
    width: 224,
    borderRadius: 12,
    border: "1px solid color-mix(in oklch, var(--lenso-control-border) 80%, transparent)",
    backgroundColor: "var(--lenso-background-grouped-secondary)",
    padding: 4,
    boxShadow: "var(--lenso-surface-shadow)",
  },
  customItem: {
    borderRadius: 8,
    backgroundColor: {
      default: "transparent",
      ":focus": "color-mix(in oklch, var(--lenso-tint) 10%, transparent)",
      ":is([aria-selected=true])": "color-mix(in oklch, var(--lenso-tint) 5%, transparent)",
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
    <ListBox.Item
      key={user.key}
      value={user.key}
      label={user.name}
      xstyle={customStyles && styles.customItem}
      render={
        renderItems
          ? (props) => <span {...props} data-custom={["foo", "bar", "baz"][index]} />
          : undefined
      }
    >
      <Avatar size="sm">
        <Avatar.Image alt={user.name} src={`/assets/demo/avatars/${user.color}.svg`} />
        <Avatar.Fallback>{user.name[0]}</Avatar.Fallback>
      </Avatar>
      <div {...stylex.props(styles.details)}>
        <Label>{user.name}</Label>
        <Description>{user.name.toLowerCase()}@example.com</Description>
      </div>
      <ListBox.Item.Indicator>
        {customCheck
          ? ({ selected }) =>
              selected ? <Check {...stylex.props(styles.check)} aria-hidden="true" /> : null
          : undefined}
      </ListBox.Item.Indicator>
    </ListBox.Item>
  ));
}
export function UsersList(
  props: Omit<ListBoxRootProps<string, boolean>, "children"> &
    React.ComponentProps<typeof UserItems>,
) {
  const { customCheck, customStyles, renderItems, count, ...root } = props;
  return (
    <ListBox<string, boolean> aria-label="用户" {...root}>
      <UserItems
        customCheck={customCheck}
        customStyles={customStyles}
        renderItems={renderItems}
        count={count}
      />
    </ListBox>
  );
}
