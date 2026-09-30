import * as stylex from "@stylexjs/stylex";

export const styles = stylex.create({
  scroll: {
    overflowX: "auto",
    marginBlock: 24,
    outlineColor: "var(--focus)",
    ":focus-visible": { outlineWidth: 2, outlineStyle: "solid", outlineOffset: 3 },
  },
  table: { borderCollapse: "collapse", width: "100%", textAlign: "start", fontSize: 13 },
  cell: {
    borderBottomWidth: 1,
    borderBottomStyle: "solid",
    borderBottomColor: "var(--border)",
    paddingBlock: 12,
    paddingInline: 12,
    verticalAlign: "top",
    minWidth: 80,
  },
  code: { whiteSpace: "pre-wrap", overflowWrap: "anywhere", fontFamily: "ui-monospace, monospace" },
  source: { display: "block", marginTop: 8, overflowWrap: "anywhere" },
});
