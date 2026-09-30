"use client";
// Adapted from HeroUI v3.2.6 (Apache-2.0).
import { Spinner } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  row: { display: "flex", alignItems: "center", gap: 32 },
  column: { display: "flex", flexDirection: "column", alignItems: "center", gap: 8 },
  caption: { fontSize: 12, lineHeight: "16px", color: "var(--muted)" },
  slow: { animationDuration: "1.5s" },
  fast: { animationDuration: ".4s" },
});
export function SpinnerSpeed() {
  return (
    <div {...stylex.props(styles.row)}>
      <div {...stylex.props(styles.column)}>
        <Spinner xstyle={styles.slow} />
        <span {...stylex.props(styles.caption)}>Slow</span>
      </div>
      <div {...stylex.props(styles.column)}>
        <Spinner />
        <span {...stylex.props(styles.caption)}>Default</span>
      </div>
      <div {...stylex.props(styles.column)}>
        <Spinner xstyle={styles.fast} />
        <span {...stylex.props(styles.caption)}>Fast</span>
      </div>
    </div>
  );
}
export default SpinnerSpeed;
