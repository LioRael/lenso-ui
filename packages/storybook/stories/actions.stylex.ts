// HeroUI v3.2.6 source-story layout adaptations, Apache-2.0.
import * as stylex from "@stylexjs/stylex";

export const actions = stylex.create({
  row: { display: "flex", gap: 12 },
  row2: { display: "flex", gap: 8 },
  aligned: { display: "flex", alignItems: "center", gap: 12 },
  aligned2: { display: "flex", alignItems: "center", gap: 8 },
  columns: { display: "flex", alignItems: "flex-start", gap: 32 },
  stack2: { display: "flex", flexDirection: "column", gap: 8 },
  stack3: { display: "flex", flexDirection: "column", gap: 12 },
  stack4: { display: "flex", flexDirection: "column", gap: 16 },
  stack6: { display: "flex", flexDirection: "column", gap: 24 },
  stack8: { display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 32 },
  centered: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  fullWidth: { display: "flex", flexDirection: "column", width: 400, gap: 12 },
  social: { display: "flex", flexDirection: "column", width: "100%", maxWidth: 320, gap: 12 },
  muted: { fontSize: 14, lineHeight: "20px", color: "var(--muted)" },
  mediumMuted: { fontSize: 14, lineHeight: "20px", fontWeight: 500, color: "var(--muted)" },
  small: { fontSize: 14, lineHeight: "20px" },
  medium: { fontWeight: 500 },
  count: { fontSize: 12, lineHeight: "16px", fontWeight: 600 },
  compactIcon: { width: 14, height: 14 },
  compactButton: { paddingInline: 8 },
  popup: { maxWidth: 290 },
  menuItem: { display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 4 },
});
