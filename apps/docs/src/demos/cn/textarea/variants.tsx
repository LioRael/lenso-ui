"use client";

import { TextArea } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  root: {
    display: "flex",
    width: 280,
    flexDirection: "column",
    gap: 8,
  },
});
export function Variants() {
  return (
    <div {...stylex.props(styles.root)}>
      <TextArea fullWidth placeholder="主要文本域" variant="primary" />
      <TextArea fullWidth placeholder="次要文本域" variant="secondary" />
    </div>
  );
}
