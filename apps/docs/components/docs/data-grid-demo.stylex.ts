import * as stylex from "@stylexjs/stylex";

export const styles = stylex.create({
  demo: { display: "grid", gap: "var(--space-3)", minWidth: 0 },
  controls: { alignItems: "center", display: "flex", flexWrap: "wrap", gap: "var(--space-3)" },
  control: {
    alignItems: "center",
    color: "var(--color-content-secondary)",
    cursor: "pointer",
    display: "inline-flex",
    fontSize: "var(--type-body-size)",
    gap: "var(--space-2)",
    whiteSpace: "nowrap",
  },
  event: {
    color: "var(--color-content-tertiary)",
    fontSize: "var(--type-body-size)",
    minHeight: "20px",
  },
  identity: { alignItems: "center", display: "inline-flex", gap: "var(--space-3)", minWidth: 0 },
  swatch: {
    borderRadius: "var(--radius-control)",
    display: "inline-block",
    flexShrink: 0,
    height: "14px",
    width: "14px",
  },
  muted: { color: "var(--color-content-tertiary)" },
});
