"use client";
import { Chip } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { s } from "../card/display.stylex";

export function ChipBasic() {
  return (
    <div {...stylex.props(s.wrap3)}>
      <Chip>Default</Chip>
      <Chip color="accent">Accent</Chip>
      <Chip color="success">Success</Chip>
      <Chip color="warning">Warning</Chip>
      <Chip color="danger">Danger</Chip>
    </div>
  );
}
