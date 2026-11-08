"use client";
import { Button } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const s = stylex.create({ row: { display: "flex", flexWrap: "wrap", gap: 12 } });
export function Disabled() {
  return (
    <div {...stylex.props(s.row)}>
      <Button disabled variant="prominent">
        Prominent
      </Button>
      <Button disabled variant="bordered">
        Bordered
      </Button>
      <Button disabled variant="borderless">
        Borderless
      </Button>
      <Button destructive disabled variant="prominent">
        Delete
      </Button>
    </div>
  );
}
