"use client";
import type { ComponentProps as StoryComponentProps } from "react";
export interface BadgeStoryProps extends Pick<
  StoryComponentProps<typeof Badge>,
  "color" | "size" | "variant" | "placement"
> {}
export const initialArgs: BadgeStoryProps = /* story-args:start */ {
  color: "danger",
  size: "sm",
  variant: "primary",
  placement: "top-right",
}; /* story-args:end */

// oxlint-disable jsx-a11y/prefer-tag-over-role -- The CSS-painted status dot has no image resource for an HTML img.
// Adapted from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e), Apache-2.0.
import { Avatar, Badge } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { s } from "../en/card/display.stylex";

export function BadgeBasic(overrides: BadgeStoryProps) {
  const args = { ...initialArgs, ...overrides };
  return (
    <div {...stylex.props(s.row6)}>
      <Badge.Anchor>
        <Avatar>
          <Avatar.Image alt="John Doe" src="/assets/demo/avatars/green.svg" />
          <Avatar.Fallback>JD</Avatar.Fallback>
        </Avatar>
        <Badge {...args}>5</Badge>
      </Badge.Anchor>
      <Badge.Anchor>
        <Avatar>
          <Avatar.Image alt="Alex Brown" src="/assets/demo/avatars/orange.svg" />
          <Avatar.Fallback>AB</Avatar.Fallback>
        </Avatar>
        <Badge color="accent" size="sm">
          New
        </Badge>
      </Badge.Anchor>
      <Badge.Anchor>
        <Avatar>
          <Avatar.Image alt="Chris Davis" src="/assets/demo/avatars/blue.svg" />
          <Avatar.Fallback>CD</Avatar.Fallback>
        </Avatar>
        <Badge role="img" aria-label="Online" color="success" placement="bottom-right" size="sm" />
      </Badge.Anchor>
    </div>
  );
}
