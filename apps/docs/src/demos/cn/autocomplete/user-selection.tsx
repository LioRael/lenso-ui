"use client";

import * as stylex from "@stylexjs/stylex";
import { NativeAutocomplete, OptionAvatar, styles } from "../../en/autocomplete/_native";
export const users = [
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
export function UserSelection() {
  return (
    <NativeAutocomplete
      items={users}
      label="用户"
      placeholder="选择用户"
      searchLabel="Search users"
      searchPlaceholder="Search users..."
      renderValue={(item) => (
        <span {...stylex.props(styles.row)}>
          <OptionAvatar item={item} small />
          {item.name}
        </span>
      )}
    />
  );
}
