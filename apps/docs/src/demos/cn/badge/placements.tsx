// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e), Apache-2.0.
import { Avatar, Badge } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { s } from "../../en/card/display.stylex";
const PLACEMENT_LABELS = {
  "bottom-left": "左下",
  "bottom-right": "右下",
  "top-left": "左上",
  "top-right": "右上",
};
const AVATAR_URL = "https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/green.jpg";
export function BadgePlacements() {
  const placements = ["top-right", "top-left", "bottom-right", "bottom-left"] as const;
  return (
    <div {...stylex.props(s.row8)}>
      {placements.map((placement) => (
        <div key={placement} {...stylex.props(s.centeredColumn2)}>
          <Badge.Anchor>
            <Avatar>
              <Avatar.Image alt="头像" src={AVATAR_URL} />
              <Avatar.Fallback>JD</Avatar.Fallback>
            </Avatar>
            <Badge color="accent" placement={placement} size="sm" />
          </Badge.Anchor>
          <span {...stylex.props(s.textXs, s.muted)}>{PLACEMENT_LABELS[placement]}</span>
        </div>
      ))}
    </div>
  );
}
