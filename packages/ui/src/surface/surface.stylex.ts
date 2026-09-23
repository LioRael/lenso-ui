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
    borderColor: tokens.colorBorderPopover,
    borderRadius: tokens.radiusPopover,
    borderStyle: "solid",
    borderWidth: "0.5px",
    boxShadow: `0 ${tokens.elevationOverlayAmbientY} ${tokens.elevationOverlayAmbientBlur} ${tokens.elevationOverlayAmbient}, 0 ${tokens.elevationOverlayKeyY} ${tokens.elevationOverlayKeyBlur} ${tokens.elevationOverlayKey}, 0 1px 1px ${tokens.elevationOverlayDetail}`,
  },
});
