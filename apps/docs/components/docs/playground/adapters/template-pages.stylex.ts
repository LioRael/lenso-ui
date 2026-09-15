import * as stylex from "@stylexjs/stylex";

export const styles = stylex.create({
  stage: {
    alignItems: "center",
    boxSizing: "border-box",
    display: "flex",
    height: "500px",
    justifyContent: "center",
    overflow: "hidden",
    padding: "16px",
    "@media (max-width: 720px)": {
      height: "560px",
      padding: "12px",
    },
  },
  frame: {
    backgroundColor: "var(--color-surface-canvas)",
    borderColor: "var(--color-border-tertiary)",
    borderRadius: "12px",
    borderStyle: "solid",
    borderWidth: "var(--size-border-control, 0.5px)",
    boxShadow:
      "0 var(--elevation-panel-key-y) var(--elevation-panel-key-blur) var(--elevation-panel-key-spread) var(--elevation-panel-key), 0 1px 1px var(--elevation-panel-detail)",
    height: "460px",
    overflow: "hidden",
    width: "min(100%, 900px)",
    "@media (max-width: 720px)": {
      height: "528px",
    },
  },
});
