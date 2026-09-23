import * as stylex from "@stylexjs/stylex";

import { tokens } from "../tokens.stylex.js";
import { motion } from "../shared/motion.stylex.js";

export const styles = stylex.create({
  root: {
    alignItems: "center",
    color: tokens.colorContentSecondary,
    display: "inline-flex",
    fontFamily: tokens.fontButton,
    fontSize: tokens.typeMetadataSize,
    fontWeight: 500,
    height: "20px",
    lineHeight: "normal",
    position: "relative",
    transitionDuration: motion.durationBase,
    transitionProperty: "color",
    transitionTimingFunction: motion.easeHover,
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
  neutral: { color: tokens.colorStatusNeutralContent },
  success: { color: tokens.colorStatusSuccessContent },
  warning: { color: tokens.colorStatusWarningContent },
  error: { color: tokens.colorStatusErrorContent },
  info: { color: tokens.colorStatusInfoContent },
  text: { color: tokens.colorContentSecondary },
});
