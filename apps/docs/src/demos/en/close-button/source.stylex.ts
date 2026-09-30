import * as stylex from "@stylexjs/stylex";
export const styles = stylex.create({
  row: { display: "flex", alignItems: "center", gap: 16 },
  column: { display: "flex", flexDirection: "column", alignItems: "center", gap: 8 },
  interactive: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  caption: { fontSize: 12, color: "var(--muted)" },
  count: { fontSize: 14, color: "var(--muted)" },
  custom: {
    width: 32,
    height: 32,
    borderRadius: 9999,
    backgroundColor: { default: "var(--default)", ":hover": "var(--default-hover)" },
    color: { default: "var(--muted)", ":hover": "var(--foreground)" },
    transform: { default: "none", ":active": "scale(.95)" },
  },
});
