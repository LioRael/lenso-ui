"use client";
// HeroUI v3.2.6, Apache-2.0. Source user data and avatar composition retained.
import { Avatar, AvatarImage, AvatarFallback, ComboBox } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { useId } from "react";
import { styles } from "./styles.stylex";
import { useFocusMenu } from "./shared";
const users = [
  {
    avatarUrl: "https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/blue.jpg",
    email: "bob@heroui.com",
    fallback: "B",
    id: "1",
    name: "Bob",
  },
  {
    avatarUrl: "https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/green.jpg",
    email: "fred@heroui.com",
    fallback: "F",
    id: "2",
    name: "Fred",
  },
  {
    avatarUrl: "https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/purple.jpg",
    email: "martha@heroui.com",
    fallback: "M",
    id: "3",
    name: "Martha",
  },
  {
    avatarUrl: "https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/red.jpg",
    email: "john@heroui.com",
    fallback: "J",
    id: "4",
    name: "John",
  },
  {
    avatarUrl: "https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/orange.jpg",
    email: "jane@heroui.com",
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
        <ComboBox.Label htmlFor={id}>User</ComboBox.Label>
        <ComboBox.InputGroup>
          <ComboBox.Input {...menu.input} id={id} placeholder="Search users..." />
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
