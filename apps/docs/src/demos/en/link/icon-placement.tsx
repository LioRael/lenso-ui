"use client";
// Adapted from HeroUI v3.2.6 (e385ac2), Apache-2.0.
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
