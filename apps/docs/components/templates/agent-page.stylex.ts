import * as stylex from "@stylexjs/stylex";

export const styles = stylex.create({
  root: {
    backgroundColor: "var(--color-surface-canvas)",
    boxSizing: "border-box",
    color: "var(--color-content-primary)",
    display: "grid",
    fontFamily: "var(--font-sans)",
    gridTemplateRows: "auto minmax(0, 1fr) auto",
    minHeight: "100%",
    minWidth: 0,
    overflow: "hidden",
  },
  header: {
    alignItems: "center",
    backgroundColor: "var(--color-surface-canvas)",
    borderBottomColor: "var(--color-border-tertiary)",
    borderBottomStyle: "solid",
    borderBottomWidth: "var(--size-border-control, 0.5px)",
    display: "flex",
    minHeight: "64px",
    paddingBlock: "12px",
    paddingInline: "24px",
  },
  title: {
    fontSize: "15px",
    fontWeight: 600,
    lineHeight: 1.4,
    margin: 0,
  },
  description: {
    color: "var(--color-content-tertiary)",
    fontSize: "12px",
    lineHeight: 1.5,
    marginBlock: "2px 0",
    marginInline: 0,
  },
  transcript: {
    minHeight: 0,
    overflowY: "auto",
  },
  turns: {
    display: "grid",
    gap: "24px",
    marginInline: "auto",
    paddingBlock: "40px 32px",
    width: "min(100% - 48px, 720px)",
    "@media (max-width: 560px)": {
      width: "min(100% - 32px, 720px)",
    },
  },
  turn: {
    display: "grid",
    gap: "6px",
  },
  userTurn: {
    backgroundColor: "var(--color-surface-selected)",
    borderRadius: "var(--radius-panel, 10px)",
    marginLeft: "auto",
    paddingBlock: "12px",
    paddingInline: "14px",
    width: "min(88%, 560px)",
  },
  turnLabel: {
    color: "var(--color-content-tertiary)",
    fontSize: "12px",
    fontWeight: 600,
    lineHeight: 1.4,
    margin: 0,
  },
  turnBody: {
    color: "var(--color-content-secondary)",
    fontSize: "14px",
    lineHeight: 1.6,
  },
  turnParagraph: {
    margin: 0,
  },
  followingTurnParagraph: {
    marginTop: "10px",
  },
  composerDock: {
    marginInline: "auto",
    paddingBlock: "0 24px",
    width: "min(100% - 48px, 720px)",
    "@media (max-width: 560px)": {
      width: "min(100% - 32px, 720px)",
    },
  },
  shortcutHint: {
    color: "var(--color-content-tertiary)",
    fontSize: "11px",
    lineHeight: 1.4,
    "@media (max-width: 560px)": {
      display: "none",
    },
  },
  visuallyHidden: {
    borderWidth: 0,
    clip: "rect(0 0 0 0)",
    height: "1px",
    overflow: "hidden",
    padding: 0,
    position: "absolute",
    whiteSpace: "nowrap",
    width: "1px",
  },
});
