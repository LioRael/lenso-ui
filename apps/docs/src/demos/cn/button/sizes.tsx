"use client";

import { Button } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  row: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
});
export function Sizes() {
  return (
    <div {...stylex.props(styles.row)}>
      <Button size="sm">小</Button>
      <Button size="md">中</Button>
      <Button size="lg">大</Button>
    </div>
  );
}
