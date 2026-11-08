"use client";
import type { ComponentProps as StoryComponentProps } from "react";
export interface AvatarGroupStoryProps extends Pick<
  StoryComponentProps<typeof AvatarGroup>,
  "color" | "size" | "variant"
> {}
export const initialArgs: AvatarGroupStoryProps = /* story-args:start */ {
  color: "default",
  size: "md",
  variant: "default",
}; /* story-args:end */

import { Avatar, AvatarGroup } from "@lenso/ui";
import { users } from "../en/avatar-group/users";

export function Basic(overrides: AvatarGroupStoryProps) {
  const args = { ...initialArgs, ...overrides };
  return (
    <AvatarGroup {...args}>
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
