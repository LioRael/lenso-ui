import * as stylex from "@stylexjs/stylex";

import { tokens } from "../tokens.stylex.js";

const shimmer = stylex.keyframes({
  from: { backgroundPositionX: "200%" },
  to: { backgroundPositionX: "-200%" },
});

export const styles = stylex.create({
  root: {
    color: tokens.colorContentSecondary,
    display: "inline-flex",
    fontFamily: tokens.fontSans,
    maxWidth: "100%",
  },
  active: {
    color: tokens.colorContentTertiary,
    "@media (prefers-reduced-motion: no-preference)": {
      animationDuration: "1.6s",
      animationIterationCount: "infinite",
      animationName: shimmer,
      animationTimingFunction: "linear",
      backgroundClip: "text",
      backgroundImage: `linear-gradient(90deg, ${tokens.colorContentTertiary} 20%, ${tokens.colorContentPrimary} 50%, ${tokens.colorContentTertiary} 80%)`,
      backgroundPositionX: "200%",
      backgroundSize: "200% 100%",
      color: "transparent",
    },
  },
});
