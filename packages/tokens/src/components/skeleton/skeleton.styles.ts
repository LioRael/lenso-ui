// modified for StyleX.
import * as stylex from "@stylexjs/stylex";
import { tokens } from "../../tokens.stylex.const.js";
const shimmer = stylex.keyframes({ to: { transform: "translateX(200%)" } });
const pulse = stylex.keyframes({ "50%": { opacity: 0.5 } });
export const skeletonStyles = stylex.create({
  root: {
    pointerEvents: "none",
    position: "relative",
    overflow: "hidden",
    borderRadius: tokens.shapeContentSm,
    backgroundColor: `color-mix(in oklab, ${tokens.backgroundGroupedTertiary} 70%, transparent)`,
  },
});
export const skeletonAnimations = stylex.create({
  shimmer: {
    "::after": {
      position: "absolute",
      inset: 0,
      translate: "-100% 0",
      animationName: { default: shimmer, "@media (prefers-reduced-motion: reduce)": "none" },
      animationDuration: "2s",
      animationTimingFunction: "linear",
      animationIterationCount: "infinite",
      backgroundImage: `linear-gradient(to right, transparent, ${tokens.backgroundGroupedTertiary}, transparent)`,
      content: {
        default: '""',
        ":has([data-skeleton-animation])": "none",
        ':is([data-skeleton-animation="shimmer"] [data-skeleton-animation])': "none",
      },
    },
    "::before": {
      position: "absolute",
      inset: 0,
      translate: "-100% 0",
      animationName: { default: shimmer, "@media (prefers-reduced-motion: reduce)": "none" },
      animationDuration: "2s",
      animationTimingFunction: "linear",
      animationIterationCount: "infinite",
      content: {
        default: "none",
        ':has([data-skeleton-animation]):not(:is([data-skeleton-animation="shimmer"] [data-skeleton-animation]))':
          '""',
      },
      backgroundImage: "var(--lenso-skeleton-shimmer)",
      zIndex: 10,
      pointerEvents: "none",
      mixBlendMode: "overlay",
    },
  },
  pulse: {
    animationName: { default: pulse, "@media (prefers-reduced-motion: reduce)": "none" },
    animationDuration: "2s",
    animationTimingFunction: "cubic-bezier(0.4, 0, 0.6, 1)",
    animationIterationCount: "infinite",
  },
  none: {},
});
export const skeletonNested = stylex.create({
  parent: {
    "::before": {
      position: "absolute",
      inset: 0,
      translate: "-100% 0",
      animationName: { default: shimmer, "@media (prefers-reduced-motion: reduce)": "none" },
      animationDuration: "2s",
      animationTimingFunction: "linear",
      animationIterationCount: "infinite",
      content: '""',
      backgroundImage: "var(--lenso-skeleton-shimmer)",
      zIndex: 10,
      pointerEvents: "none",
      mixBlendMode: "overlay",
    },
    "::after": { content: "none" },
  },
});
