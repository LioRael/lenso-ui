import * as stylex from "@stylexjs/stylex";
export const styles = stylex.create({
  column: { display: "flex", flexDirection: "column", gap: 24 },
  sizes: { display: "flex", flexDirection: "column", gap: 16 },
  section: { display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 8 },
  row: { display: "flex", alignItems: "flex-start", gap: 32 },
  full: { width: 400, display: "flex", flexDirection: "column", gap: 12 },
  caption: { fontSize: 14, color: "var(--lenso-label-secondary)" },
  menuLabel: {
    fontSize: 14,
    lineHeight: "20px",
    fontWeight: 500,
    color: "var(--lenso-label-primary)",
  },
  menuDescription: {
    fontSize: 12,
    lineHeight: "16px",
    color: "var(--lenso-label-secondary)",
    overflowWrap: "break-word",
  },
  merge: { borderRadius: 0, backgroundColor: "var(--lenso-system-green)" },
  popup: { maxWidth: 290, borderRadius: 0 },
  item: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 4,
    borderRadius: 0,
  },
});
