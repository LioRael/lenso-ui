"use client";

import { TextArea } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  field: {
    width: 384,
    height: 128,
  },
});
export function Basic() {
  return (
    <TextArea
      aria-label="快速项目更新"
      xstyle={styles.field}
      placeholder="分享一条简短的项目更新…"
    />
  );
}
