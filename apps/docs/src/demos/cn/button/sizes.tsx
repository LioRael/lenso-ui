// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
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
