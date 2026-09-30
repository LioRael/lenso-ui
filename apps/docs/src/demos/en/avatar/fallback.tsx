"use client";
// Adapted from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e), Apache-2.0.
import { Person } from "@gravity-ui/icons";
import { Avatar } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { s } from "../card/display.stylex";

export function Fallback() {
  return (
    <div {...stylex.props(s.row4)}>
      <Avatar>
        <Avatar.Fallback>JD</Avatar.Fallback>
      </Avatar>
      <Avatar>
        <Avatar.Fallback>
          <Person />
        </Avatar.Fallback>
      </Avatar>
      <Avatar>
        <Avatar.Image
          alt="Delayed Avatar"
          src="https://invalid-url-to-show-fallback.com/image.jpg"
        />
        <Avatar.Fallback delay={600}>NA</Avatar.Fallback>
      </Avatar>
      <Avatar>
        <Avatar.Fallback xstyle={s.gradientFallback}>GB</Avatar.Fallback>
      </Avatar>
    </div>
  );
}
