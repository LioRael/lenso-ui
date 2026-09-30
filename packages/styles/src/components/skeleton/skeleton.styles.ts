// Derived from HeroUI v3.2.6 (Apache-2.0); modified for StyleX.
import * as stylex from "@stylexjs/stylex";
import { tokens } from "../../tokens.stylex.const.js";
const shimmer = stylex.keyframes({ to: { transform: "translateX(200%)" } });
const pulse = stylex.keyframes({ "50%": { opacity: 0.5 } });
export const skeletonStyles = stylex.create({
  root: {
    pointerEvents: "none",
    position: "relative",
    overflow: "hidden",
    borderRadius: tokens.radiusSm,
    backgroundColor: `color-mix(in oklab, ${tokens.surfaceTertiary} 70%, transparent)`,
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
      backgroundImage: `linear-gradient(to right, transparent, ${tokens.surfaceTertiary}, transparent)`,
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
      backgroundImage:
        "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.5) 50%, transparent 100%)",
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
      backgroundImage:
        "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.5) 50%, transparent 100%)",
      zIndex: 10,
      pointerEvents: "none",
      mixBlendMode: "overlay",
    },
    "::after": { content: "none" },
  },
});
