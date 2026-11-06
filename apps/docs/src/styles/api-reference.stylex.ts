import * as stylex from "@stylexjs/stylex";

export const styles = stylex.create({
  closedIndex: { display: { default: null, ":is(details[open] > *)": "none" } },
  inheritedTable: { display: { default: null, ":is(details:not([open]) > *)": "none" } },
  reference: { minWidth: 0, maxWidth: "100%", overflowWrap: "anywhere" },
  code: { whiteSpace: "pre-wrap", overflowWrap: "anywhere", fontFamily: "ui-monospace, monospace" },
  source: { display: "block", marginTop: 8, overflowWrap: "anywhere" },
});
