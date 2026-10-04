// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 (e385ac2), Apache-2.0.
import { Link } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { styles } from "../../en/link/source.stylex";
export function LinkIconPlacement() {
  return (
    <div {...stylex.props(styles.column)}>
      <Link href="#">
        图标在末尾（默认）
        <Link.Icon />
      </Link>
      <Link href="#" xstyle={styles.gap}>
        <Link.Icon />
        图标在开头
      </Link>
    </div>
  );
}
