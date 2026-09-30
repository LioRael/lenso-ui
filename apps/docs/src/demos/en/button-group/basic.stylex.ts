import * as stylex from "@stylexjs/stylex";
export const basicStyles = stylex.create({
  root: { display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 24 },
  section: { display: "flex", flexDirection: "column", gap: 8 },
  row: { display: "flex", flexWrap: "wrap", columnGap: 8, rowGap: 16 },
  popup: { maxWidth: 290 },
  splitTrigger: { borderStartStartRadius: 0, borderEndStartRadius: 0 },
  item: { display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 4 },
  smallIcon: { width: 14, height: 14 },
  count: { fontSize: 12, fontWeight: 600 },
  countButton: { paddingInline: 8 },
});
