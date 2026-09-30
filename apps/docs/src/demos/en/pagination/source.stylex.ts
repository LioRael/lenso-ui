import * as stylex from "@stylexjs/stylex";
export const styles = stylex.create({
  center: { justifyContent: "center" },
  full: { width: "100%" },
  column: { display: "flex", flexDirection: "column", gap: 24 },
  section: { display: "flex", flexDirection: "column", gap: 8 },
  caption: { fontSize: 12, fontWeight: 500, color: "var(--muted)", textTransform: "capitalize" },
  overflow: {
    width: "100%",
    maxWidth: { default: 288, "@media (min-width: 640px)": "100%" },
    overflowX: "auto",
  },
  customContent: { gap: 4, borderRadius: 12, backgroundColor: "var(--default)", padding: 4 },
  link: {
    color: { default: "var(--muted)", ":hover": "var(--foreground)" },
    backgroundColor: { default: null, ":hover": "var(--surface)" },
  },
  active: {
    backgroundColor: { default: "var(--accent)", ":hover": "var(--accent-hover)" },
    color: "var(--accent-foreground)",
  },
});
