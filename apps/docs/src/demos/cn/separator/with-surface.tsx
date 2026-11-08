"use client";

import { Separator, Surface } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  column: {
    display: "flex",
    flexDirection: "column",
    gap: 32,
  },
  surface: {
    display: "flex",
    minWidth: 320,
    flexDirection: "column",
    gap: 12,
    borderRadius: "var(--lenso-shape-content-3xl)",
    padding: 24,
  },
  border: {
    border: "1px solid var(--lenso-control-border)",
  },
  heading: {
    fontSize: 16,
    lineHeight: "24px",
    fontWeight: 600,
    color: "var(--lenso-label-primary)",
  },
  text: {
    fontSize: 14,
    lineHeight: "20px",
    color: "var(--lenso-label-secondary)",
  },
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
          <p {...stylex.props(styles.text)}>表面内容</p>
        </Surface>
      ))}
    </div>
  );
}
export default WithSurface;
