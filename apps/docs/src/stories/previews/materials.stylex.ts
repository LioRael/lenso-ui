import * as stylex from "@stylexjs/stylex";
export const s = stylex.create({
  field: { width: "100%", maxWidth: 300 },
  slider: { width: 280, maxWidth: "100%" },
  row: { display: "flex", flexDirection: "column", alignItems: "center", gap: 24, minWidth: 0 },
  output: { fontSize: 13, color: "white", minHeight: 20 },
  glass: (width: number, height: number, radius: number) => ({
    width,
    height,
    borderRadius: radius,
    maxWidth: "100%",
    display: "grid",
    placeItems: "center",
    color: "var(--lenso-label-primary)",
    fontSize: 14,
  }),
});
