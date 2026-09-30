"use client";
// Adapted from HeroUI v3.2.6 (Apache-2.0).
import { Typography } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  panel: {
    display: "flex",
    maxWidth: 448,
    flexDirection: "column",
    gap: 8,
    borderRadius: "var(--radius-xl)",
    border: "1px solid color-mix(in oklab, var(--border) 80%, transparent)",
    backgroundColor: "var(--surface-secondary)",
    padding: 16,
  },
  category: {
    fontSize: 12,
    fontWeight: 500,
    letterSpacing: ".025em",
    color: "var(--accent)",
    textTransform: "uppercase",
  },
  title: { fontWeight: 600, letterSpacing: "-.025em", color: "var(--foreground)" },
  text: { fontSize: 14, lineHeight: 1.625, color: "var(--muted)" },
});
export function CustomStyles() {
  return (
    <div {...stylex.props(styles.panel)}>
      <Typography xstyle={styles.category} type="body-xs">
        Changelog
      </Typography>
      <Typography xstyle={styles.title} type="h4">
        Faster search results
      </Typography>
      <Typography xstyle={styles.text} type="body-sm">
        Queries now return in under 200ms thanks to an improved index.
      </Typography>
    </div>
  );
}
export default CustomStyles;
