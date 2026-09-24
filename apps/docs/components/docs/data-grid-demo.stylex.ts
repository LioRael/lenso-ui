import * as stylex from "@stylexjs/stylex";

export const styles = stylex.create({
  demo: { display: "grid", gap: "var(--space-3)", minWidth: 0 },
  event: {
    color: "var(--color-content-tertiary)",
    fontSize: "var(--type-body-size)",
    minHeight: "20px",
  },
  identity: { alignItems: "center", display: "inline-flex", gap: "var(--space-3)", minWidth: 0 },
  identityEditor: {
    alignItems: "center",
    display: "flex",
    gap: "var(--space-3)",
    height: "100%",
    minWidth: 0,
    width: "100%",
  },
  identityInput: {
    backgroundColor: "transparent",
    borderWidth: 0,
    color: "var(--color-content-primary)",
    flex: 1,
    font: "inherit",
    height: "100%",
    minWidth: 0,
    outline: "none",
    padding: 0,
    userSelect: "text",
  },
  swatch: {
    borderRadius: "var(--radius-control)",
    display: "inline-block",
    flexShrink: 0,
    height: "14px",
    width: "14px",
  },
  muted: { color: "var(--color-content-tertiary)" },
});
