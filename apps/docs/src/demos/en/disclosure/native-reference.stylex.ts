import * as stylex from "@stylexjs/stylex";
export const nativeReferenceStyles = stylex.create({
  root: { width: "100%", maxWidth: 448, textAlign: "center" },
  body: {
    boxShadow: "var(--lenso-surface-shadow)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    borderRadius: 24,
    backgroundColor: "var(--lenso-background-grouped-secondary)",
    padding: 16,
    textAlign: "center",
  },
  muted: { fontSize: 14, color: "var(--lenso-label-secondary)" },
  qr: { aspectRatio: "1", width: "100%", maxWidth: 216, objectFit: "cover" },
  action: { marginTop: 16 },
});
