// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e), Apache-2.0.
import { Avatar } from "@lenso/ui";
import { s } from "../../en/card/display.stylex";
export function CustomStyles() {
  return (
    <Avatar xstyle={s.roundLg}>
      <Avatar.Image alt="张三" src="https://img.heroui.chat/image/avatar?w=400&h=400&u=3" />
      <Avatar.Fallback xstyle={s.roundLg}>张三</Avatar.Fallback>
    </Avatar>
  );
}
