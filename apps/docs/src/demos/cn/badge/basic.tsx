// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

import { Avatar, Badge } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { demoStyles } from "../../demo.stylex";
export function BadgeBasic() {
  return (
    <div {...stylex.props(demoStyles.row)}>
      <Badge.Anchor>
        <Avatar>
          <Avatar.Image
            alt="头像"
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
            alt="头像"
            src="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/orange.jpg"
          />
          <Avatar.Fallback>AB</Avatar.Fallback>
        </Avatar>
        <Badge color="accent" size="sm">
          新
        </Badge>
      </Badge.Anchor>
      <Badge.Anchor>
        <Avatar>
          <Avatar.Image
            alt="头像"
            src="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/blue.jpg"
          />
          <Avatar.Fallback>CD</Avatar.Fallback>
        </Avatar>
        <Badge aria-label="Online" color="success" placement="bottom-right" size="sm" />
      </Badge.Anchor>
    </div>
  );
}
