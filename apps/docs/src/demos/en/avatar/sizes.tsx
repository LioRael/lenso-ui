"use client";
import { Avatar } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { s } from "../card/display.stylex";

export function Sizes() {
  return (
    <div {...stylex.props(s.row4)}>
      <Avatar size="sm">
        <Avatar.Image alt="Small Avatar" src="/assets/demo/avatars/blue.svg" />
        <Avatar.Fallback>SM</Avatar.Fallback>
      </Avatar>
      <Avatar size="md">
        <Avatar.Image alt="Medium Avatar" src="/assets/demo/avatars/purple.svg" />
        <Avatar.Fallback>MD</Avatar.Fallback>
      </Avatar>
      <Avatar size="lg">
        <Avatar.Image alt="Large Avatar" src="/assets/demo/avatars/red.svg" />
        <Avatar.Fallback>LG</Avatar.Fallback>
      </Avatar>
    </div>
  );
}
