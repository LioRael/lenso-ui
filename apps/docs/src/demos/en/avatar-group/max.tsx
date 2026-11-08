"use client";
import { Avatar, AvatarGroup } from "@lenso/ui";
import { users } from "./users";

export function Max() {
  return (
    <AvatarGroup max={3}>
      {users.map((user) => (
        <Avatar key={user.id}>
          <Avatar.Image alt={user.name} src={user.image} />
          <Avatar.Fallback>
            {user.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </Avatar.Fallback>
        </Avatar>
      ))}
    </AvatarGroup>
  );
}
