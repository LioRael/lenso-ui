// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 (e385ac2), Apache-2.0.
import { ArrowUpRightFromSquare, Link as LinkIcon } from "@gravity-ui/icons";
import { Link } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { styles } from "../../en/link/source.stylex";
export function LinkCustomIcon() {
  return (
    <div {...stylex.props(styles.column)}>
      <Link href="#">
        外部链接
        <Link.Icon xstyle={styles.marginIcon}>
          <ArrowUpRightFromSquare />
        </Link.Icon>
      </Link>
      <Link href="#" xstyle={styles.gap}>
        前往页面
        <Link.Icon xstyle={styles.icon}>
          <LinkIcon />
        </Link.Icon>
      </Link>
    </div>
  );
}
