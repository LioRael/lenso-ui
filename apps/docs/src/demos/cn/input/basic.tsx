// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

import { Input } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";

// HeroUI v3.2.6, e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e, Apache-2.0.
const styles = stylex.create({
  field: {
    width: 256,
  },
});
export function Basic() {
  return <Input aria-label="姓名" xstyle={styles.field} placeholder="输入你的姓名" />;
}
