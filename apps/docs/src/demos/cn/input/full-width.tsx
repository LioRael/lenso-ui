"use client";

import { Input } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  root: {
    width: 400,
  },
});
export function FullWidth() {
  return (
    <div {...stylex.props(styles.root)}>
      <Input fullWidth placeholder="全宽输入框" />
    </div>
  );
}
