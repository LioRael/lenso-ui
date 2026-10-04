// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 (e385ac2), Apache-2.0.
import { Link } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { styles } from "../../en/link/source.stylex";
export function LinkUnderlineAndOffset() {
  return (
    <div {...stylex.props(styles.sections)}>
      <div {...stylex.props(styles.section)}>
        <p {...stylex.props(styles.caption)}>默认悬浮下划线</p>
        <Link href="#">
          悬浮以查看下划线
          <Link.Icon />
        </Link>
      </div>
      <div {...stylex.props(styles.section)}>
        <p {...stylex.props(styles.caption)}>始终显示下划线</p>
        <Link href="#" xstyle={styles.underline}>
          下划线始终可见
          <Link.Icon />
        </Link>
      </div>
      <div {...stylex.props(styles.section)}>
        <p {...stylex.props(styles.caption)}>无下划线</p>
        <Link href="#" xstyle={styles.noUnderline}>
          不带任何下划线的链接
          <Link.Icon />
        </Link>
      </div>
      <div {...stylex.props(styles.section)}>
        <p {...stylex.props(styles.caption)}>调整下划线偏移</p>
        <div {...stylex.props(styles.column)}>
          {[styles.offset1, styles.offset2, styles.offset3, styles.offset4].map((offset, index) => (
            <Link key={index} href="#" xstyle={offset}>
              Offset {index + 1} ({index + 1}px space)
              <Link.Icon />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
