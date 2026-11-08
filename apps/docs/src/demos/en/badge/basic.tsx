"use client";
// oxlint-disable jsx-a11y/prefer-tag-over-role -- The CSS-painted status dot has no image resource for an HTML img.
import { Avatar, Badge } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { s } from "../card/display.stylex";

export function BadgeBasic() {
  return (
    <div {...stylex.props(s.row6)}>
      <Badge.Anchor>
        <Avatar>
          <Avatar.Image alt="John Doe" src="/assets/demo/avatars/green.svg" />
          <Avatar.Fallback>JD</Avatar.Fallback>
        </Avatar>
        <Badge color="danger" size="sm">
          5
        </Badge>
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
