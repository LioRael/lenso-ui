// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

/** HeroUI v3.2.6 adaptation. Copyright 2026 HeroUI. SPDX-License-Identifier: Apache-2.0 */
import { Avatar, AvatarImage, AvatarFallback } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { exampleStyles, SelectExample } from "../../en/select/select-example";
const users = [
  {
    id: "1",
    name: "Bob",
    email: "bob@heroui.com",
    color: "blue",
  },
  {
    id: "2",
    name: "Fred",
    email: "fred@heroui.com",
    color: "green",
  },
  {
    id: "3",
    name: "Martha",
    email: "martha@heroui.com",
    color: "purple",
  },
  {
    id: "4",
    name: "John",
    email: "john@heroui.com",
    color: "red",
  },
  {
    id: "5",
    name: "Jane",
    email: "jane@heroui.com",
    color: "orange",
  },
];
function UserAvatar({ user, small = false }: { user: (typeof users)[number]; small?: boolean }) {
  return (
    <Avatar size="sm" xstyle={small ? exampleStyles.smallAvatar : undefined}>
      <AvatarImage
        src={`https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/${user.color}.jpg`}
        alt=""
      />
      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
    </Avatar>
  );
}
export function CustomValue() {
  return (
    <SelectExample
      label="用户"
      placeholder="请选择用户"
      choices={users.map((user) => ({
        value: user.id,
        label: user.name,
        content: (
          <div {...stylex.props(exampleStyles.row)}>
            <UserAvatar user={user} />
            <div {...stylex.props(exampleStyles.details)}>
              <span>{user.name}</span>
              <span {...stylex.props(exampleStyles.note)}>{user.email}</span>
            </div>
          </div>
        ),
      }))}
      valueContent={(value) => {
        const user = users.find((item) => item.id === value);
        return user ? (
          <span {...stylex.props(exampleStyles.row)}>
            <UserAvatar user={user} small />
            <span>{user.name}</span>
          </span>
        ) : (
          "Select a user"
        );
      }}
    />
  );
}
