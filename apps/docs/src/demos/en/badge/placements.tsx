"use client";
import { Avatar, Badge } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { s } from "../card/display.stylex";

const AVATAR_URL = "/assets/demo/avatars/green.svg";
export function BadgePlacements() {
  const placements = ["top-right", "top-left", "bottom-right", "bottom-left"] as const;
  return (
    <div {...stylex.props(s.row8)}>
      {placements.map((placement) => (
        <div key={placement} {...stylex.props(s.centeredColumn2)}>
          <Badge.Anchor>
            <Avatar>
              <Avatar.Image alt="John Doe" src={AVATAR_URL} />
              <Avatar.Fallback>JD</Avatar.Fallback>
            </Avatar>
            <Badge color="accent" placement={placement} size="sm" />
          </Badge.Anchor>
          <span {...stylex.props(s.textXs, s.muted)}>{placement}</span>
        </div>
      ))}
    </div>
  );
}
