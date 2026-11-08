import * as stylex from "@stylexjs/stylex";

export const glassContainerStyles = stylex.create({
  root: { position: "relative", isolation: "isolate" },
  tint: (tint: string) => ({
    "--lenso-glass-container-tint": tint,
  }),
  rim: {
    position: "absolute",
    inset: 0,
    backgroundSize: "100% 100%",
    pointerEvents: "none",
    maskRepeat: "no-repeat",
  },
  outline: {
    position: "absolute",
    inset: 0,
    zIndex: 1,
    pointerEvents: "none",
    backgroundSize: "100% 100%",
    backgroundRepeat: "no-repeat",
    maskRepeat: "no-repeat",
  },
  surface: {
    position: "absolute",
    top: 0,
    left: 0,
    pointerEvents: "none",
    zIndex: 1,
    maskRepeat: "no-repeat",
    "--lg-material": "apple",
    "--lg-material-size": "1",
    "--apple-material-profile": "small",
    "--lg-blur": "var(--lenso-glass-small-blur, 15.3px)",
    backgroundColor: "transparent",
    backgroundImage: "var(--lenso-glass-preference-paint, none)",
    backdropFilter: {
      default: "blur(var(--lg-blur)) var(--lg-filter, saturate(1))",
      ":is([data-copy], [data-material-paints])": "none",
    },
    display: { default: null, ":is([hidden])": "none" },
  },
});
