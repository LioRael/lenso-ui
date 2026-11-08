"use client";

// Source user data and avatar composition retained.
import { Avatar, AvatarImage, AvatarFallback, ComboBox } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { useId } from "react";
import { styles } from "../../en/combo-box/styles.stylex";
import { useFocusMenu } from "../../en/combo-box/shared";
const users = [
  {
    avatarUrl: "/assets/demo/avatars/blue.svg",
    email: "bob@example.com",
    fallback: "B",
    id: "1",
    name: "Bob",
  },
  {
    avatarUrl: "/assets/demo/avatars/green.svg",
    email: "fred@example.com",
    fallback: "F",
    id: "2",
    name: "Fred",
  },
  {
    avatarUrl: "/assets/demo/avatars/purple.svg",
    email: "martha@example.com",
    fallback: "M",
    id: "3",
    name: "Martha",
  },
  {
    avatarUrl: "/assets/demo/avatars/red.svg",
    email: "john@example.com",
    fallback: "J",
    id: "4",
    name: "John",
  },
  {
    avatarUrl: "/assets/demo/avatars/orange.svg",
    email: "jane@example.com",
    fallback: "J",
    id: "5",
    name: "Jane",
  },
];
export function CustomValue() {
  const id = useId();
  const menu = useFocusMenu();
  return (
    <div {...stylex.props(styles.field)}>
      <ComboBox<(typeof users)[number]>
        {...menu.root}
        items={users}
        itemToStringLabel={(user) => user.name}
        itemToStringValue={(user) => user.id}
      >
        <ComboBox.Label htmlFor={id}>用户</ComboBox.Label>
        <ComboBox.InputGroup>
          <ComboBox.Input {...menu.input} id={id} placeholder="搜索用户…" />
          <ComboBox.Trigger aria-label="Show users">
            <ComboBox.Indicator />
          </ComboBox.Trigger>
        </ComboBox.InputGroup>
        <ComboBox.Portal>
          <ComboBox.Positioner>
            <ComboBox.Popover>
              <ComboBox.List>
                {(user: (typeof users)[number]) => (
                  <ComboBox.Item key={user.id} value={user}>
                    <Avatar size="sm">
                      <AvatarImage src={user.avatarUrl} alt="" />
                      <AvatarFallback>{user.fallback}</AvatarFallback>
                    </Avatar>
                    <div {...stylex.props(styles.user)}>
                      <span>{user.name}</span>
                      <span {...stylex.props(styles.muted)}>{user.email}</span>
                    </div>
                    <ComboBox.ItemIndicator />
                  </ComboBox.Item>
                )}
              </ComboBox.List>
            </ComboBox.Popover>
          </ComboBox.Positioner>
        </ComboBox.Portal>
      </ComboBox>
    </div>
  );
}
