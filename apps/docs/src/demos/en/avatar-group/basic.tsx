"use client";
import { Avatar, AvatarGroup } from "@lenso/ui";
import { users } from "./users";

export function Basic() {
  return (
    <AvatarGroup>
      {users.slice(0, 4).map((user) => (
        <Avatar key={user.id}>
          <Avatar.Image alt={user.name} src={user.image} />
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
