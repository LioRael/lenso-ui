"use client";

import { Avatar } from "@lenso/ui";
const SRC = "/assets/demo/avatars/blue.svg";
export function CustomImageComponent() {
  return (
    <Avatar>
      <Avatar.Image
        alt="约翰·多伊"
        height={40}
        src={SRC}
        width={40}
        render={<img alt="约翰·多伊" src={SRC} height={40} width={40} />}
      />
      <Avatar.Fallback>JD</Avatar.Fallback>
    </Avatar>
  );
}
