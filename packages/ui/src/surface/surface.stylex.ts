import * as stylex from "@stylexjs/stylex";

import { tokens } from "../tokens.stylex.js";

export const styles = stylex.create({
  root: {
    alignItems: "flex-start",
    boxSizing: "border-box",
    color: tokens.colorContentPrimary,
    display: "flex",
    flexDirection: "column",
    gap: tokens.space3,
    minWidth: 0,
    padding: tokens.space6,
  },
  embedded: {
    backgroundColor: tokens.colorSurfaceSurface,
    borderRadius: tokens.radiusPanel,
  },
  panel: {
    backgroundColor: tokens.colorSurfacePanel,
    borderRadius: tokens.radiusPanel,
    borderColor: tokens.colorBorderDecorative,
    borderStyle: "solid",
    borderWidth: "1px",
  },
  overlay: {
    backgroundColor: tokens.colorSurfacePopover,
    borderRadius: tokens.radiusPopover,
    boxShadow: `0 1px 2px ${tokens.elevationPanelDetail}, 0 6px 20px ${tokens.elevationOverlayAmbient}`,
  },
});
