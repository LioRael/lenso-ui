"use client";

import { Avatar } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { s } from "../../en/card/display.stylex";
export function Basic() {
  return (
    <div {...stylex.props(s.row4)}>
      <Avatar>
        <Avatar.Image alt="约翰·多伊" src="/assets/demo/avatars/purple.svg" />
        <Avatar.Fallback>JD</Avatar.Fallback>
      </Avatar>
      <Avatar>
        <Avatar.Image alt="蓝色头像" src="/assets/demo/avatars/blue.svg" />
        <Avatar.Fallback>B</Avatar.Fallback>
      </Avatar>
      <Avatar>
        <Avatar.Fallback>JR</Avatar.Fallback>
      </Avatar>
    </div>
  );
}
