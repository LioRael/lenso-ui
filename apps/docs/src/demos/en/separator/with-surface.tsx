"use client";
// Adapted from HeroUI v3.2.6 (Apache-2.0).
import { Separator, Surface } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  column: { display: "flex", flexDirection: "column", gap: 32 },
  surface: {
    display: "flex",
    minWidth: 320,
    flexDirection: "column",
    gap: 12,
    borderRadius: "var(--radius-3xl)",
    padding: 24,
  },
  border: { border: "1px solid var(--border)" },
  heading: { fontSize: 16, lineHeight: "24px", fontWeight: 600, color: "var(--foreground)" },
  text: { fontSize: 14, lineHeight: "20px", color: "var(--muted)" },
});
export function WithSurface() {
  return (
    <div {...stylex.props(styles.column)}>
      {(["default", "secondary", "tertiary", "transparent"] as const).map((variant) => (
        <Surface
          key={variant}
          xstyle={[styles.surface, variant === "transparent" && styles.border]}
          variant={variant}
        >
          <h3 {...stylex.props(styles.heading)}>
            {variant[0]?.toUpperCase()}
            {variant.slice(1)} Surface
          </h3>
          <Separator variant={variant === "transparent" ? "default" : variant} />
          <p {...stylex.props(styles.text)}>Surface Content</p>
        </Surface>
      ))}
    </div>
  );
}
export default WithSurface;
