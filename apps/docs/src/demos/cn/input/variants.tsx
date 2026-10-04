// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e), Apache-2.0.
import { Input } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  root: {
    display: "flex",
    width: 240,
    flexDirection: "column",
    gap: 8,
  },
});
export function Variants() {
  return (
    <div {...stylex.props(styles.root)}>
      <Input fullWidth placeholder="主要输入框" variant="primary" />
      <Input fullWidth placeholder="次要输入框" variant="secondary" />
    </div>
  );
}
