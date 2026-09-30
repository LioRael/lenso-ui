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
    borderRadius: "var(--radius-xl)",
    backgroundColor: "transparent",
  },
  bone: { height: 96, borderRadius: "var(--radius-xl)" },
});
export function SingleShimmer() {
  return (
    <Skeleton xstyle={styles.grid}>
      <Skeleton animationType="none" xstyle={styles.bone} />
      <Skeleton animationType="none" xstyle={styles.bone} />
      <Skeleton animationType="none" xstyle={styles.bone} />
    </Skeleton>
  );
}
export default SingleShimmer;
