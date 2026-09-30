"use client";
// Adapted from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e), Apache-2.0.
import { TextArea } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({ root: { width: 400 } });
export function FullWidth() {
  return (
    <div {...stylex.props(styles.root)}>
      <TextArea fullWidth placeholder="Full width textarea" />
    </div>
  );
}
