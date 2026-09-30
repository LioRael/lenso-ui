// Derived from HeroUI v3.2.6 (Apache-2.0); modified for StyleX and observed edges.
import * as stylex from "@stylexjs/stylex";
// Typed properties are needed for interpolation and for inactive (non-overflowing) timelines.
export const scrollShadowProperties = `
@property --scroll-shadow-start-fade { syntax: "<length>"; inherits: false; initial-value: 0px; }
@property --scroll-shadow-end-fade { syntax: "<length>"; inherits: false; initial-value: 0px; }
`;
const startFade = stylex.keyframes({
  from: { "--scroll-shadow-start-fade": "0px" } as Parameters<typeof stylex.keyframes>[0][string],
  to: { "--scroll-shadow-start-fade": "var(--scroll-shadow-size)" } as Parameters<
    typeof stylex.keyframes
  >[0][string],
});
const endFade = stylex.keyframes({
  from: { "--scroll-shadow-end-fade": "var(--scroll-shadow-size)" } as Parameters<
    typeof stylex.keyframes
  >[0][string],
  to: { "--scroll-shadow-end-fade": "0px" } as Parameters<typeof stylex.keyframes>[0][string],
});
export const scrollShadowStyles = stylex.create({
  root: {
    position: "relative",
    "--scroll-shadow-size": "40px",
    "--scroll-shadow-scrollbar-size": "10px",
    "--scroll-shadow-offset": "0px",
    "--scroll-shadow-before": "var(--scroll-shadow-observed-before, 0px)",
    "--scroll-shadow-after": "var(--scroll-shadow-observed-after, 0px)",
  },
  vertical: { overflowY: "auto", scrollbarWidth: "thin" },
  horizontal: { overflowX: "auto", scrollbarWidth: "thin" },
  hideScrollBar: {
    scrollbarWidth: "none",
    "--scroll-shadow-scrollbar-size": "0px",
    "::-webkit-scrollbar": { display: "none" },
  },
  automatic: {
    animationName: {
      default: "none",
      "@supports (animation-timeline: scroll(self))": `${startFade}, ${endFade}`,
    },
    animationTimingFunction: "linear",
    animationDuration: "auto",
    animationFillMode: "both",
    animationRange:
      "var(--scroll-shadow-offset) calc(var(--scroll-shadow-offset) + var(--scroll-shadow-size)), calc(100% - var(--scroll-shadow-size) - var(--scroll-shadow-offset)) calc(100% - var(--scroll-shadow-offset))",
    "--scroll-shadow-before": {
      default: "var(--scroll-shadow-observed-before, 0px)",
      "@supports (animation-timeline: scroll(self))": "var(--scroll-shadow-start-fade)",
    },
    "--scroll-shadow-after": {
      default: "var(--scroll-shadow-observed-after, 0px)",
      "@supports (animation-timeline: scroll(self))": "var(--scroll-shadow-end-fade)",
    },
  },
  // Chromium retains an absolute-range animation's previous fill after overflow disappears.
  // The first paint still uses the native timeline; only measured no-overflow resets its fill.
  inactive: {
    animationName: "none",
    "--scroll-shadow-before": "0px",
    "--scroll-shadow-after": "0px",
  },
  verticalTimeline: { animationTimeline: "scroll(self block), scroll(self block)" },
  horizontalTimeline: { animationTimeline: "scroll(self inline), scroll(self inline)" },
  verticalMask: {
    maskImage:
      "linear-gradient(180deg, transparent 0, #000 var(--scroll-shadow-before), #000 calc(100% - var(--scroll-shadow-after)), transparent 100%), linear-gradient(#000, #000)",
    maskPosition: "left top, right top",
    maskRepeat: "no-repeat",
    maskSize:
      "calc(100% - var(--scroll-shadow-scrollbar-size)) 100%, var(--scroll-shadow-scrollbar-size) 100%",
  },
  horizontalMask: {
    maskImage: {
      default:
        "linear-gradient(90deg, transparent 0, #000 var(--scroll-shadow-before), #000 calc(100% - var(--scroll-shadow-after)), transparent 100%), linear-gradient(#000, #000)",
      ":dir(rtl)":
        "linear-gradient(270deg, transparent 0, #000 var(--scroll-shadow-before), #000 calc(100% - var(--scroll-shadow-after)), transparent 100%), linear-gradient(#000, #000)",
    },
    maskPosition: "left top, left bottom",
    maskRepeat: "no-repeat",
    maskSize:
      "100% calc(100% - var(--scroll-shadow-scrollbar-size)), 100% var(--scroll-shadow-scrollbar-size)",
  },
  geometry: (size: number, offset: number, before: boolean, after: boolean) => ({
    "--scroll-shadow-size": `${size}px`,
    "--scroll-shadow-offset": `${offset}px`,
    "--scroll-shadow-observed-before": before ? `${size}px` : "0px",
    "--scroll-shadow-observed-after": after ? `${size}px` : "0px",
  }),
});
