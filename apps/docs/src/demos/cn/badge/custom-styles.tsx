// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e), Apache-2.0.
import { Avatar, Badge } from "@lenso/ui";
import { s } from "../../en/card/display.stylex";
export function CustomStyles() {
  return (
    <Badge.Anchor>
      <Avatar>
        <Avatar.Image
          alt="凯特·威尔逊"
          src="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/blue.jpg"
        />
        <Avatar.Fallback>KW</Avatar.Fallback>
      </Avatar>
      <Badge xstyle={s.badgeNumber} color="accent" size="sm" variant="soft">
        5
      </Badge>
    </Badge.Anchor>
  );
}
