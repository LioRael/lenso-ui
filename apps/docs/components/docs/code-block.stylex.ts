import * as stylex from "@stylexjs/stylex";

export const styles = stylex.create({
  root: {
    backgroundColor: "var(--color-surface-translucent)",
    borderRadius: "10px",
    boxShadow: "inset 0 0 0 0.5px var(--color-border-translucent)",
    color: "var(--docs-fg-primary)",
    fontFamily: '"IBM Plex Mono", ui-monospace, monospace',
    fontSize: "11px",
    fontWeight: 400,
    height: "auto",
    lineHeight: "16px",
    margin: 0,
    minHeight: 0,
    overflow: "auto",
    padding: "16px",
    whiteSpace: "pre",
    width: "1080px",
    "@media (max-width: 1320px)": { width: "100%" },
  },
});
