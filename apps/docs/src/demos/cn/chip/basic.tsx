// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

import { Chip } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { demoStyles } from "../../demo.stylex";
export function ChipBasic() {
  return (
    <div {...stylex.props(demoStyles.row)}>
      <Chip>默认</Chip>
      <Chip color="accent">强调</Chip>
      <Chip color="success">成功</Chip>
      <Chip color="warning">警告</Chip>
      <Chip color="danger">危险</Chip>
    </div>
  );
}
