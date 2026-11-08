"use client";

import { Input } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";

const styles = stylex.create({
  field: {
    width: 256,
  },
});
export function Basic() {
  return <Input aria-label="姓名" xstyle={styles.field} placeholder="输入你的姓名" />;
}
