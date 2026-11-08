"use client";

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
