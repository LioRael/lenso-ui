"use client";
// Adapted from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e), Apache-2.0.
import { Avatar, AvatarGroup } from "@lenso/ui";
import { users } from "./users";

export function Count() {
  const total = 12;
  return (
    <AvatarGroup size="sm">
      {users.slice(0, 3).map((user) => (
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
      <AvatarGroup.Count>+{total - 3}</AvatarGroup.Count>
    </AvatarGroup>
  );
}
