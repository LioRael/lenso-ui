// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

import { Button } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  row: {
    display: "flex",
    flexWrap: "wrap",
    gap: 12,
  },
});
export function Variants() {
  return (
    <div {...stylex.props(styles.row)}>
      <Button variant="primary">主要</Button>
      <Button variant="secondary">次要</Button>
      <Button variant="tertiary">第三</Button>
      <Button variant="outline">线框</Button>
      <Button variant="ghost">幽灵</Button>
      <Button variant="danger">危险</Button>
    </div>
  );
}
