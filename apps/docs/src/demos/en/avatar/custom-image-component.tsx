"use client";
import { Avatar } from "@lenso/ui";

const SRC = "/assets/demo/avatars/blue.svg";

export function CustomImageComponent() {
  return (
    <Avatar>
      <Avatar.Image
        alt="John Doe"
        height={40}
        src={SRC}
        width={40}
        render={<img alt="John Doe" src={SRC} height={40} width={40} />}
      />
      <Avatar.Fallback>JD</Avatar.Fallback>
    </Avatar>
  );
}
