"use client";
// Adapted from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e), Apache-2.0.
import { Kbd } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { s } from "../card/display.stylex";

export function InstructionalText() {
  return (
    <div>
      <div {...stylex.props(s.kbdPanel)}>
        <h4 {...stylex.props(s.kbdHeading)}>Quick Actions</h4>
        <ul {...stylex.props(s.textSm)}>
          <li>
            • Open search:{" "}
            <Kbd>
              <Kbd.Abbr keyValue="command" />
              <Kbd.Content>K</Kbd.Content>
            </Kbd>
          </li>
          <li {...stylex.props(s.space2)}>
            • Toggle sidebar:{" "}
            <Kbd>
              <Kbd.Abbr keyValue="command" />
              <Kbd.Content>B</Kbd.Content>
            </Kbd>
          </li>
          <li {...stylex.props(s.space2)}>
            • New file:{" "}
            <Kbd>
              <Kbd.Abbr keyValue="command" />
              <Kbd.Content>N</Kbd.Content>
            </Kbd>
          </li>
          <li {...stylex.props(s.space2)}>
            • Quick save:{" "}
            <Kbd>
              <Kbd.Abbr keyValue="command" />
              <Kbd.Content>S</Kbd.Content>
            </Kbd>
          </li>
        </ul>
      </div>
    </div>
  );
}
