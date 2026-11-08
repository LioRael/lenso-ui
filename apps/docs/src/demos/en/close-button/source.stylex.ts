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
  caption: { fontSize: 12, color: "var(--lenso-label-secondary)" },
  count: { fontSize: 14, color: "var(--lenso-label-secondary)" },
  custom: {
    width: 32,
    height: 32,
    borderRadius: 9999,
    backgroundColor: {
      default: "var(--lenso-control-fill)",
      ":hover": "var(--lenso-control-hover-fill)",
    },
    color: { default: "var(--lenso-label-secondary)", ":hover": "var(--lenso-label-primary)" },
    transform: { default: "none", ":active": "scale(.95)" },
  },
});
