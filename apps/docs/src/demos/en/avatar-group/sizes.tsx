"use client";
// Adapted from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e), Apache-2.0.
import { Avatar, AvatarGroup } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { s } from "../card/display.stylex";
import { users } from "./users";

export function Sizes() {
  const sizes = [
    { size: "sm", label: "Small" },
    { size: "md", label: "Medium (default)" },
    { size: "lg", label: "Large" },
  ] as const;
  return (
    <div {...stylex.props(s.centeredColumn6)}>
      {sizes.map(({ size, label }) => (
        <div key={size} {...stylex.props(s.centeredColumn2)}>
          <p {...stylex.props(s.textSm, s.muted)}>{label}</p>
          <AvatarGroup size={size}>
            {users.slice(0, 4).map((user) => (
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
        </div>
      ))}
    </div>
  );
}
