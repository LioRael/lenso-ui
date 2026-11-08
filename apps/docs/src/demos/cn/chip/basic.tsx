"use client";

import { Chip } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { s } from "../../en/card/display.stylex";
export function ChipBasic() {
  return (
    <div {...stylex.props(s.wrap3)}>
      <Chip>默认</Chip>
      <Chip color="accent">强调</Chip>
      <Chip color="success">成功</Chip>
      <Chip color="warning">警告</Chip>
      <Chip color="danger">危险</Chip>
    </div>
  );
}
