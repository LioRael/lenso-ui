"use client";

import { Button } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";

const styles = stylex.create({ row: { display: "flex", alignItems: "center", gap: 12 } });
export function Sizes() {
  return (
    <div {...stylex.props(styles.row)}>
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  );
}
