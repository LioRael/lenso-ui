"use client";
// Adapted from HeroUI v3.2.6 (Apache-2.0).
import { Skeleton } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  panel: {
    width: 250,
    display: "flex",
    flexDirection: "column",
    gap: 20,
    borderRadius: "var(--radius-lg)",
    backgroundColor: "transparent",
    padding: 16,
    boxShadow: "var(--shadow-panel)",
  },
  text: { display: "flex", flexDirection: "column", gap: 12 },
  picture: { height: 128, borderRadius: "var(--radius-lg)" },
  short: { height: 12, width: "60%", borderRadius: "var(--radius-lg)" },
  long: { height: 12, width: "80%", borderRadius: "var(--radius-lg)" },
  shortest: { height: 12, width: "40%", borderRadius: "var(--radius-lg)" },
});
export function Basic() {
  return (
    <div {...stylex.props(styles.panel)}>
      <Skeleton xstyle={styles.picture} />
      <div {...stylex.props(styles.text)}>
        <Skeleton xstyle={styles.short} />
        <Skeleton xstyle={styles.long} />
        <Skeleton xstyle={styles.shortest} />
      </div>
    </div>
  );
}
export default Basic;
