"use client";
import { Kbd } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { s } from "../card/display.stylex";

export function Basic() {
  return (
    <div {...stylex.props(s.row4)}>
      <Kbd>
        <Kbd.Abbr keyValue="command" />
        <Kbd.Content>K</Kbd.Content>
      </Kbd>
      <Kbd>
        <Kbd.Abbr keyValue="shift" />
        <Kbd.Content>P</Kbd.Content>
      </Kbd>
      <Kbd>
        <Kbd.Abbr keyValue="ctrl" />
        <Kbd.Content>C</Kbd.Content>
      </Kbd>
      <Kbd>
        <Kbd.Abbr keyValue="option" />
        <Kbd.Content>D</Kbd.Content>
      </Kbd>
    </div>
  );
}
