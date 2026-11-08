"use client";
import { Kbd } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { s } from "../card/display.stylex";

export function InlineUsage() {
  return (
    <div>
      <p {...stylex.props(s.textSm)}>
        Press{" "}
        <Kbd>
          <Kbd.Content>Esc</Kbd.Content>
        </Kbd>{" "}
        to close the dialog.
      </p>
      <p {...stylex.props(s.textSm, s.space4)}>
        Use{" "}
        <Kbd>
          <Kbd.Abbr keyValue="command" />
          <Kbd.Content>K</Kbd.Content>
        </Kbd>{" "}
        to open the command palette.
      </p>
      <p {...stylex.props(s.textSm, s.space4)}>
        Navigate with{" "}
        <Kbd>
          <Kbd.Abbr keyValue="up" />
        </Kbd>{" "}
        and{" "}
        <Kbd>
          <Kbd.Abbr keyValue="down" />
        </Kbd>{" "}
        arrow keys.
      </p>
      <p {...stylex.props(s.textSm, s.space4)}>
        Save your work with{" "}
        <Kbd>
          <Kbd.Abbr keyValue="command" />
          <Kbd.Content>S</Kbd.Content>
        </Kbd>{" "}
        regularly.
      </p>
    </div>
  );
}
