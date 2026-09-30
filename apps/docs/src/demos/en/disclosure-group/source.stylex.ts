import * as stylex from "@stylexjs/stylex";
export const styles = stylex.create({
  root: { width: "100%", maxWidth: 384 },
  custom: {
    width: "100%",
    maxWidth: 384,
    borderRadius: 12,
    backgroundColor: "var(--default-soft)",
    padding: 8,
  },
  trigger: { width: "100%", justifyContent: "space-between" },
  muted: { color: "var(--muted)" },
  body: { fontSize: 14, color: "var(--muted)" },
  separator: { marginBlock: 4 },
  actions: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  buttons: { display: "flex", gap: 8 },
});
