import * as stylex from "@stylexjs/stylex";

import { tokens } from "../tokens.stylex.js";

export const styles = stylex.create({
  root: {
    alignItems: "center",
    backgroundColor: tokens.colorSurfacePopover,
    borderColor: tokens.colorBorderTertiary,
    borderRadius: tokens.radiusRounded,
    borderStyle: "solid",
    borderWidth: "1px",
    bottom: "12px",
    boxShadow: `0 ${tokens.elevationOverlayAmbientY} ${tokens.elevationOverlayAmbientBlur} ${tokens.elevationOverlayAmbient}, 0 ${tokens.elevationOverlayKeyY} ${tokens.elevationOverlayKeyBlur} ${tokens.elevationOverlayKey}`,
    boxSizing: "border-box",
    color: tokens.colorContentPrimary,
    display: "inline-flex",
    gap: "8px",
    left: "50%",
    maxWidth: "calc(100% - 24px)",
    minHeight: "44px",
    paddingBlock: "5px",
    paddingLeft: "16px",
    paddingRight: "6px",
    position: "absolute",
    transform: "translateX(-50%)",
    whiteSpace: "nowrap",
    zIndex: 50,
  },
  count: { fontSize: tokens.typeLabelSize, fontWeight: 500, whiteSpace: "nowrap" },
  actions: { alignItems: "center", display: "inline-flex", gap: "6px", minWidth: 0 },
  action: {
    backgroundColor: tokens.colorSurfacePopover,
    borderRadius: tokens.radiusRounded,
    boxShadow: `inset 0 0 0 1px ${tokens.colorBorderDecorative}, 0 1px 2px ${tokens.elevationOverlayDetail}`,
    color: tokens.colorContentPrimary,
    height: "32px",
    minHeight: "32px",
    paddingInline: "12px",
    ":hover": { backgroundColor: tokens.colorSurfaceLevel3 },
  },
  actionIcon: { alignItems: "center", display: "inline-flex", height: "16px", width: "16px" },
  dismiss: {
    borderRadius: tokens.radiusRounded,
    height: "30px",
    width: "30px",
  },
});
