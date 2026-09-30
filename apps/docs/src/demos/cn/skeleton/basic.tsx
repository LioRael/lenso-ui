// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

import { Skeleton } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  card: {
    width: 250,
    maxWidth: "100%",
    padding: 16,
    borderRadius: 8,
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },
  cover: {
    height: 128,
    borderRadius: 8,
  },
  lines: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  first: {
    height: 12,
    width: "60%",
    borderRadius: 8,
  },
  second: {
    height: 12,
    width: "80%",
    borderRadius: 8,
  },
  third: {
    height: 12,
    width: "40%",
    borderRadius: 8,
  },
});
export function Basic() {
  return (
    <div aria-label="Loading content" {...stylex.props(styles.card)}>
      <Skeleton xstyle={styles.cover} />
      <div {...stylex.props(styles.lines)}>
        <Skeleton xstyle={styles.first} />
        <Skeleton xstyle={styles.second} />
        <Skeleton xstyle={styles.third} />
      </div>
    </div>
  );
}
