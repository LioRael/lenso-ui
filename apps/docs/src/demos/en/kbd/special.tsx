"use client";
// Adapted from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e), Apache-2.0.
import { Kbd } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { s } from "../card/display.stylex";

export function SpecialKeys() {
  return (
    <div>
      <p {...stylex.props(s.textSm)}>
        Press{" "}
        <Kbd>
          <Kbd.Abbr keyValue="enter" />
        </Kbd>{" "}
        to confirm or{" "}
        <Kbd>
          <Kbd.Abbr keyValue="escape" />
        </Kbd>{" "}
        to cancel.
      </p>
      <p {...stylex.props(s.textSm, s.space3)}>
        Use{" "}
        <Kbd>
          <Kbd.Abbr keyValue="tab" />
        </Kbd>{" "}
        to navigate between form fields and{" "}
        <Kbd>
          <Kbd.Abbr keyValue="shift" />
          <Kbd.Abbr keyValue="tab" />
        </Kbd>{" "}
        to go back.
      </p>
      <p {...stylex.props(s.textSm, s.space3)}>
        Hold{" "}
        <Kbd>
          <Kbd.Abbr keyValue="space" />
        </Kbd>{" "}
        to temporarily enable panning mode.
      </p>
    </div>
  );
}
