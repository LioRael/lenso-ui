"use client";
// Adapted from HeroUI v3.2.6 (Apache-2.0).
import { Skeleton } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  grid: {
    display: "grid",
    width: "100%",
    maxWidth: 576,
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 16,
  },
  bone: { height: 96, borderRadius: "var(--radius-xl)" },
});
export function Grid() {
  return (
    <div {...stylex.props(styles.grid)}>
      <Skeleton xstyle={styles.bone} />
      <Skeleton xstyle={styles.bone} />
      <Skeleton xstyle={styles.bone} />
    </div>
  );
}
export default Grid;
