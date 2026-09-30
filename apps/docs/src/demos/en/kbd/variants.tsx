"use client";
// Adapted from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e), Apache-2.0.
import { Kbd } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { s } from "../card/display.stylex";

export function Variants() {
  return (
    <div {...stylex.props(s.column4)}>
      {[
        { label: "Copy:", key: "C" },
        { label: "Paste:", key: "V" },
        { label: "Cut:", key: "X" },
      ].map((action) => (
        <div key={action.key} {...stylex.props(s.row2)}>
          <span>{action.label}</span>
          <Kbd>
            <Kbd.Abbr keyValue="command" />
            <Kbd.Content>{action.key}</Kbd.Content>
          </Kbd>
          <Kbd variant="light">
            <Kbd.Abbr keyValue="command" />
            <Kbd.Content>{action.key}</Kbd.Content>
          </Kbd>
        </div>
      ))}
    </div>
  );
}
