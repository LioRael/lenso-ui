"use client";
// Adapted from HeroUI v3.2.6 (e385ac2), Apache-2.0.
import { ArrowUpRightFromSquare, Link as LinkIcon } from "@gravity-ui/icons";
import { Link } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { styles } from "./source.stylex";
export function LinkCustomIcon() {
  return (
    <div {...stylex.props(styles.column)}>
      <Link href="#">
        External link
        <Link.Icon xstyle={styles.marginIcon}>
          <ArrowUpRightFromSquare />
        </Link.Icon>
      </Link>
      <Link href="#" xstyle={styles.gap}>
        Go to page
        <Link.Icon xstyle={styles.icon}>
          <LinkIcon />
        </Link.Icon>
      </Link>
    </div>
  );
}
