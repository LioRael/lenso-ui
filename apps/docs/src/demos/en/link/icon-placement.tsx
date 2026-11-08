"use client";
import { Link } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { styles } from "./source.stylex";
export function LinkIconPlacement() {
  return (
    <div {...stylex.props(styles.column)}>
      <Link href="#">
        Icon at end (default)
        <Link.Icon />
      </Link>
      <Link href="#" xstyle={styles.gap}>
        <Link.Icon />
        Icon at start
      </Link>
    </div>
  );
}
