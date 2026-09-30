"use client";
// Adapted from HeroUI v3.2.6 (Apache-2.0).
import { Skeleton } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  grid: {
    display: "grid",
    width: "100%",
    maxWidth: 576,
    gridTemplateColumns: {
      default: "1fr",
      "@media (min-width: 640px)": "repeat(2, minmax(0, 1fr))",
      "@media (min-width: 1024px)": "repeat(3, minmax(0, 1fr))",
    },
    gap: 24,
  },
  column: { display: "flex", flexDirection: "column", gap: 8 },
  label: {
    fontSize: 12,
    lineHeight: "16px",
    color: "var(--muted)",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  panel: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    borderRadius: "var(--radius-lg)",
    backgroundColor: "transparent",
    padding: 16,
    boxShadow: "var(--shadow-panel)",
  },
  picture: { height: 80, borderRadius: "var(--radius-lg)" },
  short: { height: 12, width: "60%", borderRadius: "var(--radius-lg)" },
  long: { height: 12, width: "80%", borderRadius: "var(--radius-lg)" },
});
export function AnimationTypes() {
  return (
    <div {...stylex.props(styles.grid)}>
      {(["shimmer", "pulse", "none"] as const).map((animationType) => (
        <div key={animationType} {...stylex.props(styles.column)}>
          <p {...stylex.props(styles.label)}>
            {animationType === "shimmer" ? "Shimmer" : animationType === "pulse" ? "Pulse" : "None"}
          </p>
          <div {...stylex.props(styles.panel)}>
            <Skeleton animationType={animationType} xstyle={styles.picture} />
            <Skeleton animationType={animationType} xstyle={styles.short} />
            <Skeleton animationType={animationType} xstyle={styles.long} />
          </div>
        </div>
      ))}
    </div>
  );
}
export default AnimationTypes;
