import * as stylex from "@stylexjs/stylex";

// Local iOS 27 export: 10456:1593/1594 and 10456:2980/2981.
// Optical maps stay at the pressed geometry; motion only composites them.
export const knobMaterialStyles = stylex.create({
  content: {
    position: "absolute",
    inset: -24,
    pointerEvents: "none",
    visibility: "hidden",
    zIndex: 0,
  },
  layer: {
    position: "absolute",
    inset: 0,
    borderRadius: "inherit",
    pointerEvents: "none",
    "--lg-material": "apple",
    "--lg-bezel": "7",
    "--lg-refraction": ".8",
    "--lg-dispersion": "0",
    "--lg-saturation": "1",
    "--lg-light-intensity": "0",
    "--lg-light-angle": "0",
    "--lg-bevel": "1",
    "--lg-splay": "0",
    "--lg-blur": "0px",
    backgroundImage: "var(--lg-rim, none), var(--lenso-glass-preference-paint, none)",
    backgroundSize: "100% 100%",
    backdropFilter: {
      default: "var(--lg-filter, saturate(1)) opacity(var(--lenso-glass-face-opacity, 1))",
      ":is([data-copy], [data-lenso-glass-opaque])": "none",
    },
    opacity: "calc((1 - var(--control-knob-face, 1)) / .91)",
    display: {
      default: "block",
      "@media (forced-colors: active), (prefers-reduced-transparency: reduce), (prefers-contrast: more)":
        "none",
    },
    boxShadow: {
      default:
        "inset 0 0 0 .5px rgb(0 0 0 / .2), inset 0 40px 30px -40px rgb(0 0 0 / .098), inset 0 -40px 10px -40px rgb(255 255 255 / .157), inset 0 40px 10px -40px rgb(255 255 255 / .157)",
      ":is([data-material-filter])":
        "inset 0 40px 30px -40px rgb(0 0 0 / .098), inset 0 -40px 10px -40px rgb(255 255 255 / .157), inset 0 40px 10px -40px rgb(255 255 255 / .157)",
    },
    "::before": {
      content: '""',
      position: "absolute",
      inset: 0,
      borderRadius: "inherit",
      backgroundColor: "rgb(255 255 255 / .09)",
      pointerEvents: "none",
      opacity: { default: 1, ":is([data-material-filter])": 0 },
    },
    "::after": {
      content: '""',
      position: "absolute",
      inset: 0,
      borderRadius: "inherit",
      pointerEvents: "none",
      boxShadow:
        "inset 0 -3px .5px -2.25px rgb(255 255 255 / .157), inset 0 3px .5px -2.25px rgb(255 255 255 / .157)",
    },
  },
  toggle: { "--apple-material-profile": "toggle-knob" },
  controlEdge: {
    // Local track lenses own displacement; keep the existing material and rim.
    "--lg-refraction": "0",
    "--lg-anchor-edge": "1",
    "--lg-edge-bezel-ratio": ".2",
    "--lg-edge-strength": ".85",
  },
  sliderEdge: { "--lg-edge-bezel-ratio": ".18", "--lg-edge-strength": ".7" },
  slider: {
    "--apple-material-profile": "slider-knob",
    boxShadow: {
      default:
        "inset 0 0 0 .5px rgb(0 0 0 / .2), inset 0 15px 25px -10px rgb(0 0 0 / .1), inset 0 -40px 10px -40px rgb(255 255 255 / .157), inset 0 40px 10px -40px rgb(255 255 255 / .25)",
      ":is([data-material-filter])":
        "inset 0 15px 25px -10px rgb(0 0 0 / .1), inset 0 -40px 10px -40px rgb(255 255 255 / .157), inset 0 40px 10px -40px rgb(255 255 255 / .25)",
    },
  },
  face: {
    position: "absolute",
    inset: 0,
    borderRadius: "inherit",
    pointerEvents: "none",
    backgroundColor: "white",
    opacity: {
      default: "calc((var(--control-knob-face, 1) - .09) / .91)",
      "@media (forced-colors: active), (prefers-reduced-transparency: reduce)": 1,
    },
  },
});
