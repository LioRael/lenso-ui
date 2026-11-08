"use client";
import { Button } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const s = stylex.create({ row: { display: "flex", flexWrap: "wrap", gap: 12 } });
export function Variants() {
  return (
    <div {...stylex.props(s.row)}>
      <Button variant="prominent">Prominent</Button>
      <Button variant="bordered">Bordered</Button>
      <Button variant="borderless">Borderless</Button>
      <Button variant="prominent" destructive>
        Delete
      </Button>
    </div>
  );
}
