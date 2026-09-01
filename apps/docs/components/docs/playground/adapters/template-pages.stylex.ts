import * as stylex from "@stylexjs/stylex";

import { tokens } from "@lenso/tokens/tokens.stylex";

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
    backgroundColor: tokens.colorSurfaceCanvas,
    borderColor: tokens.colorBorderTertiary,
    borderRadius: "12px",
    borderStyle: "solid",
    borderWidth: tokens.sizeBorderControl,
    boxShadow: `0 ${tokens.elevationPanelKeyY} ${tokens.elevationPanelKeyBlur} ${tokens.elevationPanelKeySpread} ${tokens.elevationPanelKey}, 0 1px 1px ${tokens.elevationPanelDetail}`,
    height: "460px",
    overflow: "hidden",
    width: "min(100%, 900px)",
    "@media (max-width: 720px)": {
      height: "528px",
    },
  },
});
