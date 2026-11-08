"use client";

import { TextArea } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  root: {
    width: 400,
  },
});
export function FullWidth() {
  return (
    <div {...stylex.props(styles.root)}>
      <TextArea fullWidth placeholder="全宽文本域" />
    </div>
  );
}
