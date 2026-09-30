// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

import { Avatar, AvatarGroup } from "@lenso/ui";
const users = [
  {
    image: "blue",
    name: "张明",
  },
  {
    image: "green",
    name: "李华",
  },
  {
    image: "purple",
    name: "王芳",
  },
  {
    image: "orange",
    name: "刘洋",
  },
];
export function Basic() {
  return (
    <AvatarGroup>
      {users.map((user) => (
        <Avatar key={user.name}>
          <Avatar.Image
            alt={user.name}
            src={`https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/${user.image}.jpg`}
          />
          <Avatar.Fallback>
            {user.name
              .split(" ")
              .map((name) => name[0])
              .join("")}
          </Avatar.Fallback>
        </Avatar>
      ))}
    </AvatarGroup>
  );
}
