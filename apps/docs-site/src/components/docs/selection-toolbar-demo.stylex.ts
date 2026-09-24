import * as stylex from "@stylexjs/stylex";

export const styles = stylex.create({
  stage: { minHeight: "232px", position: "relative" },
  list: { display: "grid", gap: "2px", maxWidth: "360px" },
  row: {
    alignItems: "center",
    borderRadius: "var(--radius-row)",
    color: "var(--color-content-primary)",
    display: "flex",
    fontSize: "var(--type-label-size)",
    gap: "10px",
    minHeight: "38px",
    paddingInline: "10px",
    ":hover": { backgroundColor: "var(--color-surface-interactive-hover)" },
  },
  selected: { backgroundColor: "var(--color-surface-selected)" },
  status: {
    color: "var(--color-content-tertiary)",
    fontSize: "var(--type-metadata-size)",
    margin: "10px",
  },
});
