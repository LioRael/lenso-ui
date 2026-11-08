"use client";
import { Avatar, Badge } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { s } from "../card/display.stylex";

const AVATAR_URL = "/assets/demo/avatars/green.svg";
export function BadgeSizes() {
  const sizes = ["sm", "md", "lg"] as const;
  return (
    <div {...stylex.props(s.row6)}>
      {sizes.map((size) => (
        <Badge.Anchor key={size}>
          <Avatar size={size}>
            <Avatar.Image alt="John Doe" src={AVATAR_URL} />
            <Avatar.Fallback>JD</Avatar.Fallback>
          </Avatar>
          <Badge color="danger" size={size}>
            5
          </Badge>
        </Badge.Anchor>
      ))}
    </div>
  );
}
