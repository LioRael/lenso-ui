"use client";

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
