"use client";
// Adapted from HeroUI v3.2.6 (Apache-2.0).
import { Spinner } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  row: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    borderRadius: "var(--radius-xl)",
    border: "1px solid var(--border)",
    backgroundColor: "var(--surface)",
    paddingInline: 20,
    paddingBlock: 16,
  },
  accent: { color: "var(--accent)" },
  muted: { color: "var(--muted)" },
  success: { color: "var(--success)" },
});
export function CustomStyles() {
  return (
    <div {...stylex.props(styles.row)}>
      <Spinner xstyle={styles.accent} size="sm" />
      <Spinner xstyle={styles.muted} size="md" />
      <Spinner xstyle={styles.success} size="lg" />
    </div>
  );
}
export default CustomStyles;
