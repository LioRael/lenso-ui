"use client";
/** HeroUI v3.2.6 adaptation. SPDX-License-Identifier: Apache-2.0 */
import * as stylex from "@stylexjs/stylex";
import { NativeAutocomplete, OptionAvatar, styles } from "./_native";
export const users = [
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
export function UserSelection() {
  return (
    <NativeAutocomplete
      items={users}
      label="User"
      placeholder="Select a user"
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
