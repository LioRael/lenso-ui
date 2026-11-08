"use client";

import { Avatar, Badge } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { s } from "../../en/card/display.stylex";
const AVATAR_URL = "/assets/demo/avatars/green.svg";
export function BadgeDot() {
  const colors = ["accent", "success", "warning", "danger"] as const;
  return (
    <div {...stylex.props(s.row6)}>
      {colors.map((color) => (
        <Badge.Anchor key={color}>
          <Avatar>
            <Avatar.Image alt="头像" src={AVATAR_URL} />
            <Avatar.Fallback>JD</Avatar.Fallback>
          </Avatar>
          <Badge color={color} placement="bottom-right" size="sm" />
        </Badge.Anchor>
      ))}
    </div>
  );
}
