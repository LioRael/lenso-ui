"use client";
import { Input } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  root: { display: "flex", width: 240, flexDirection: "column", gap: 8 },
});
export function Variants() {
  return (
    <div {...stylex.props(styles.root)}>
      <Input fullWidth placeholder="Primary input" variant="primary" />
      <Input fullWidth placeholder="Secondary input" variant="secondary" />
    </div>
  );
}
