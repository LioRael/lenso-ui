"use client";

import { Avatar } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { s } from "../../en/card/display.stylex";
export function Sizes() {
  return (
    <div {...stylex.props(s.row4)}>
      <Avatar size="sm">
        <Avatar.Image alt="小尺寸头像" src="/assets/demo/avatars/blue.svg" />
        <Avatar.Fallback>SM</Avatar.Fallback>
      </Avatar>
      <Avatar size="md">
        <Avatar.Image alt="中尺寸头像" src="/assets/demo/avatars/purple.svg" />
        <Avatar.Fallback>MD</Avatar.Fallback>
      </Avatar>
      <Avatar size="lg">
        <Avatar.Image alt="大尺寸头像" src="/assets/demo/avatars/red.svg" />
        <Avatar.Fallback>LG</Avatar.Fallback>
      </Avatar>
    </div>
  );
}
