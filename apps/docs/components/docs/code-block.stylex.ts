import * as stylex from "@stylexjs/stylex";

export const styles = stylex.create({
  root: {
    backgroundColor: "var(--color-surface-control)",
    borderRadius: "10px",
    color: "var(--color-content-primary)",
    fontFamily: '"IBM Plex Mono", ui-monospace, monospace',
    fontSize: "12px",
    fontWeight: 400,
    height: "auto",
    lineHeight: "18px",
    margin: 0,
    minHeight: 0,
    overflow: "auto",
    padding: "16px",
    whiteSpace: "pre",
    minWidth: 0,
    width: "100%",
    "@media (max-width: 720px)": { padding: "14px" },
  },
});
