import * as stylex from "@stylexjs/stylex";

export const demoStyles = stylex.create({
  row: { display: "flex", flexWrap: "wrap", alignItems: "center", gap: 16 },
  column: { display: "flex", flexDirection: "column", gap: 4 },
  wideColumn: { display: "flex", flexDirection: "column", gap: 16, width: "100%", maxWidth: 384 },
  field: { width: 256, maxWidth: "100%" },
  card: { width: 400, maxWidth: "100%" },
  muted: { color: "var(--muted)", fontSize: 14 },
  icon: { width: 24, height: 24 },
});
