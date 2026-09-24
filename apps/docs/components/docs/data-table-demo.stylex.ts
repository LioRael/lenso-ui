import * as stylex from "@stylexjs/stylex";

export const styles = stylex.create({
  demo: { minWidth: 0, position: "relative" },
  selectCell: { paddingInline: "8px" },
  actionCell: { paddingInline: "8px", textAlign: "right" },
  revealControl: {
    opacity: { default: 0, "@media (hover: none)": 1 },
    ":focus-visible": { opacity: 1 },
  },
  revealVisible: { opacity: 1 },
  actionConcealed: {
    borderRadius: "var(--radius-control)",
    height: "28px",
    justifyContent: "center",
    opacity: { default: 0, "@media (hover: none)": 1 },
    paddingInline: 0,
    width: "28px",
    ":focus-visible": { opacity: 1, outline: "2px solid var(--color-focus-ring)" },
  },
  actionVisible: {
    borderRadius: "var(--radius-control)",
    height: "28px",
    justifyContent: "center",
    opacity: 1,
    paddingInline: 0,
    width: "28px",
    ":hover": { backgroundColor: "var(--color-surface-interactive-hover)" },
    ":focus-visible": { outline: "2px solid var(--color-focus-ring)" },
  },
  identity: { alignItems: "center", display: "flex", gap: "10px", minWidth: 0 },
  identityCopy: { display: "flex", flexDirection: "column", gap: "1px", minWidth: 0 },
  name: {
    color: "var(--color-content-primary)",
    lineHeight: "17px",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  handle: { color: "var(--color-content-tertiary)", fontSize: "11px", lineHeight: "13px" },
  status: {
    color: "var(--color-content-secondary)",
    display: "block",
    fontSize: "12px",
    minHeight: "18px",
    paddingTop: "6px",
  },
});
