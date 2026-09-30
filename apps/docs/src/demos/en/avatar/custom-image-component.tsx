"use client";
// Adapted from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e), Apache-2.0.
import { Avatar } from "@lenso/ui";
import Image from "next/image";

const SRC = "https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/blue.jpg";

export function CustomImageComponent() {
  return (
    <Avatar>
      <Avatar.Image
        alt="John Doe"
        height={40}
        src={SRC}
        width={40}
        render={<Image alt="John Doe" src={SRC} height={40} width={40} unoptimized />}
      />
      <Avatar.Fallback>JD</Avatar.Fallback>
    </Avatar>
  );
}
