"use client";
import { Bell } from "@gravity-ui/icons";
import { Avatar, Badge } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { s } from "../card/display.stylex";

const AVATAR_URL = "/assets/demo/avatars/green.svg";
export function BadgeWithContent() {
  return (
    <div {...stylex.props(s.row6)}>
      {["5", "New", "99+"].map((content) => (
        <Badge.Anchor key={content}>
          <Avatar>
            <Avatar.Image alt="John Doe" src={AVATAR_URL} />
            <Avatar.Fallback>JD</Avatar.Fallback>
          </Avatar>
          <Badge color="danger" size="sm">
            {content}
          </Badge>
        </Badge.Anchor>
      ))}
      <Badge.Anchor>
        <Avatar>
          <Avatar.Image alt="John Doe" src={AVATAR_URL} />
          <Avatar.Fallback>JD</Avatar.Fallback>
        </Avatar>
        <Badge color="accent" size="sm">
          <Bell {...stylex.props(s.iconDot)} />
        </Badge>
      </Badge.Anchor>
    </div>
  );
}
