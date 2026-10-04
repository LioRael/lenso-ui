// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 (Apache-2.0).
import { Spinner } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  row: {
    display: "flex",
    alignItems: "center",
    gap: 32,
  },
  column: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
  },
  caption: {
    fontSize: 12,
    lineHeight: "16px",
    color: "var(--muted)",
  },
  slow: {
    animationDuration: "1.5s",
  },
  fast: {
    animationDuration: ".4s",
  },
});
export function SpinnerSpeed() {
  return (
    <div {...stylex.props(styles.row)}>
      <div {...stylex.props(styles.column)}>
        <Spinner xstyle={styles.slow} />
        <span {...stylex.props(styles.caption)}>慢速</span>
      </div>
      <div {...stylex.props(styles.column)}>
        <Spinner />
        <span {...stylex.props(styles.caption)}>默认</span>
      </div>
      <div {...stylex.props(styles.column)}>
        <Spinner xstyle={styles.fast} />
        <span {...stylex.props(styles.caption)}>快速</span>
      </div>
    </div>
  );
}
export default SpinnerSpeed;
