import * as stylex from "@stylexjs/stylex";

import { tokens } from "../tokens.stylex.js";

export const styles = stylex.create({
  root: {
    alignItems: "center",
    color: tokens.colorContentSecondary,
    display: "inline-flex",
    fontFamily: tokens.fontButton,
    fontSize: "11px",
    fontWeight: 500,
    height: "20px",
    lineHeight: "normal",
    position: "relative",
    whiteSpace: "nowrap",
  },
  label: { gap: "8px" },
  dot: {
    backgroundColor: "currentColor",
    borderRadius: tokens.radiusRounded,
    display: "block",
    flex: "0 0 8px",
    height: "8px",
    width: "8px",
  },
  neutral: { color: tokens.colorStatusPresenceOffline },
  success: { color: tokens.colorStatusPresenceOnline },
  warning: { color: tokens.colorStatusPresenceAway },
  error: { color: tokens.colorStatusPresenceBusy },
  info: { color: tokens.colorContentSecondary },
  text: { color: tokens.colorContentSecondary },
});
