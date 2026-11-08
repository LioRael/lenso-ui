"use client";
import { Input } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({ root: { width: 400 } });
export function FullWidth() {
  return (
    <div {...stylex.props(styles.root)}>
      <Input fullWidth placeholder="Full width input" />
    </div>
  );
}
