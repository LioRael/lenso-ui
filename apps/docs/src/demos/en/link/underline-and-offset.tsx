"use client";
// Adapted from HeroUI v3.2.6 (e385ac2), Apache-2.0.
import { Link } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { styles } from "./source.stylex";
export function LinkUnderlineAndOffset() {
  return (
    <div {...stylex.props(styles.sections)}>
      <div {...stylex.props(styles.section)}>
        <p {...stylex.props(styles.caption)}>Default hover underline</p>
        <Link href="#">
          Hover to see the underline
          <Link.Icon />
        </Link>
      </div>
      <div {...stylex.props(styles.section)}>
        <p {...stylex.props(styles.caption)}>Always visible underline</p>
        <Link href="#" xstyle={styles.underline}>
          Underline always visible
          <Link.Icon />
        </Link>
      </div>
      <div {...stylex.props(styles.section)}>
        <p {...stylex.props(styles.caption)}>No underline</p>
        <Link href="#" xstyle={styles.noUnderline}>
          Link without any underline
          <Link.Icon />
        </Link>
      </div>
      <div {...stylex.props(styles.section)}>
        <p {...stylex.props(styles.caption)}>Changing the underline offset</p>
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
