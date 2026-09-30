"use client";
// oxlint-disable jsx-a11y/prefer-tag-over-role -- The CSS-painted status dot has no image resource for an HTML img.
// Adapted from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e), Apache-2.0.
import { Avatar, Badge } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { s } from "../card/display.stylex";

export function BadgeBasic() {
  return (
    <div {...stylex.props(s.row6)}>
      <Badge.Anchor>
        <Avatar>
          <Avatar.Image
            alt="John Doe"
            src="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/green.jpg"
          />
          <Avatar.Fallback>JD</Avatar.Fallback>
        </Avatar>
        <Badge color="danger" size="sm">
          5
        </Badge>
      </Badge.Anchor>
      <Badge.Anchor>
        <Avatar>
          <Avatar.Image
            alt="Alex Brown"
            src="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/orange.jpg"
          />
          <Avatar.Fallback>AB</Avatar.Fallback>
        </Avatar>
        <Badge color="accent" size="sm">
          New
        </Badge>
      </Badge.Anchor>
      <Badge.Anchor>
        <Avatar>
          <Avatar.Image
            alt="Chris Davis"
            src="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/blue.jpg"
          />
          <Avatar.Fallback>CD</Avatar.Fallback>
        </Avatar>
        <Badge role="img" aria-label="Online" color="success" placement="bottom-right" size="sm" />
      </Badge.Anchor>
    </div>
  );
}
