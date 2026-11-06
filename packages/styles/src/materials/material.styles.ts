import * as stylex from "@stylexjs/stylex";

// Web material mappings use the supplied Apple material reference.
export const liquidMaterialStyles = stylex.create({
  // Press lighting is a separate layer so fallback contours keep their own lifetime.
  pressHighlight: {
    position: "absolute",
    inset: 0,
    borderRadius: "inherit",
    pointerEvents: "none",
    zIndex: -1,
    visibility: "var(--lenso-fusion-local-light, visible)",
    backgroundColor: "var(--lenso-glass-press-fill, rgb(236 236 240 / .85))",
    maskImage:
      "radial-gradient(circle var(--lg-light-radius, 150px) at var(--lg-light-x, 50%) var(--lg-light-y, 50%), black, rgb(0 0 0 / .88) 35%, rgb(0 0 0 / .45) 65%, transparent)",
    opacity: {
      default: 0,
      ':is(:active > *, [data-lenso-pressed] > *, [data-lenso-light-pressed] > *, [data-lenso-key-pressed] > *):not(:disabled > *, [aria-disabled="true"] > *, [data-disabled] > *, [data-pending] > *)': 1,
    },
    transitionProperty: "opacity",
    transitionDuration: {
      default: "220ms",
      ":is(:active > *, [data-lenso-pressed] > *, [data-lenso-light-pressed] > *, [data-lenso-key-pressed] > *)":
        "0ms",
      "@media (prefers-reduced-motion: reduce)": "0ms",
    },
    transitionTimingFunction: "ease-out",
    "@media (forced-colors: active)": { display: "none" },
  },
  menu: {
    opacity: "calc(var(--lg-menu-surface-opacity, 1) * var(--lg-menu-popup-opacity, 1))",
    transition: "var(--lg-menu-fade-transition, none)",
  },
  small: {
    "--apple-material-profile": "small",
    "--lg-material": "apple",
    "--lg-bezel": "var(--lenso-glass-depth, 30)",
    "--lg-refraction": "var(--lenso-glass-refraction, .7)",
    "--lg-dispersion": "var(--lenso-glass-dispersion, .2)",
    "--lg-saturation": "1",
    "--lg-light-angle": "var(--lenso-glass-angle, 0)",
    "--lg-light-intensity": "var(--lenso-glass-small-light, .25)",
    "--lg-bevel": "1",
    "--lg-splay": "var(--lenso-glass-splay, .2)",
    "--lg-blur": "var(--lenso-glass-small-blur, 3px)",
    backgroundImage:
      "var(--lenso-fusion-rim, var(--lg-rim, none)), var(--lenso-glass-preference-paint, none)",
    backgroundSize: "var(--lenso-fusion-rim-size, 100% 100%)",
    backgroundPosition: "var(--lenso-fusion-rim-position, 0 0)",
    backgroundRepeat: "no-repeat",
    backdropFilter: {
      default:
        "blur(var(--lg-blur)) var(--lenso-fusion-filter, var(--lg-filter, saturate(1))) opacity(calc(var(--lenso-glass-face-opacity, 1) * var(--lenso-fusion-opacity, 1)))",
      ":is([data-copy], [data-material-paints], [data-lenso-glass-fused])": "none",
      ':is(:disabled, [aria-disabled="true"])': "none",
      ":is([data-lenso-glass-opaque])": "none",
    },
    boxShadow:
      "var(--lenso-fusion-shadow, var(--lenso-glass-shadow, var(--lenso-material-action-shadow)))",
    "::before": {
      display: { default: null, ":is([data-lenso-glass-preferences])": "none" },
      content: '""',
      position: "absolute",
      inset: 0,
      borderRadius: "inherit",
      pointerEvents: "none",
      zIndex: -1,
      backgroundColor:
        "var(--lenso-glass-material-fill, var(--lenso-glass-small-fill, var(--lenso-material-action-fill)))",
      mixBlendMode: "var(--lenso-glass-material-blend, var(--lenso-glass-small-blend, luminosity))",
      opacity: {
        default: 1,
        ':is([data-material-filter], [data-material-paints], :disabled, [aria-disabled="true"])': 0,
      },
    },
    "::after": {
      display: { default: null, ":is([data-lenso-glass-opaque])": "none" },
      content: '""',
      position: "absolute",
      inset: 0,
      borderRadius: "inherit",
      pointerEvents: "none",
      boxShadow:
        "var(--lenso-glass-contour, var(--lenso-material-fallback-contour, inset 0 40px 30px -40px rgb(0 0 0 / .098), inset 0 -40px 10px -40px var(--lenso-material-action-inner-light), inset 0 40px 10px -40px var(--lenso-material-action-inner-light)))",
      mixBlendMode: "var(--lenso-material-fallback-contour-blend, normal)",
      opacity: { default: 1, ':is([data-material-filter], :disabled, [aria-disabled="true"])': 0 },
    },
  },
  medium: {
    "--apple-material-profile": "medium",
    "--lg-blur": "var(--lenso-glass-medium-blur, 8px)",
    "--lg-light-intensity": "var(--lenso-glass-panel-light, .25)",
    boxShadow:
      "var(--lenso-glass-panel-shadow, var(--lenso-glass-shadow, var(--lenso-material-panel-shadow)))",
    "::before": {
      backgroundColor: "var(--lenso-glass-medium-fill, var(--lenso-material-panel-fill))",
      mixBlendMode: "normal",
    },
    "::after": {
      boxShadow:
        "var(--lenso-glass-contour, var(--lenso-material-fallback-panel-contour, inset 0 -40px 10px -40px var(--lenso-material-action-inner-light), inset 0 40px 10px -40px var(--lenso-material-action-inner-light)))",
    },
  },
  livePaintContainer: { display: "contents" },
  livePaint: {
    position: "fixed",
    top: 0,
    left: 0,
    pointerEvents: "none",
    transformOrigin: "0 0",
  },
  localPaint: {
    position: "absolute",
    top: 0,
    left: 0,
    pointerEvents: "none",
    transformOrigin: "0 0",
  },
  large: {
    "--apple-material-profile": "large",
    "--lg-blur": "var(--lenso-glass-large-blur, 8px)",
    "::before": {
      backgroundColor: "var(--lenso-glass-large-fill, var(--lenso-material-panel-fill))",
    },
  },
  clear: {
    "--lenso-material-action-inner-light": "rgb(255 255 255 / .157)",
    "--lenso-material-fallback-contour": "var(--lenso-material-fallback-clear-contour)",
    "--apple-material-profile": "clear",
    "--lg-light-intensity": "var(--lenso-glass-clear-light, .4)",
    "--lg-blur": "var(--lenso-glass-clear-blur, 3px)",
    "--lg-refraction": "var(--lenso-glass-clear-refraction, .7)",
    boxShadow: "var(--lenso-glass-clear-shadow, 0 8px 15px rgb(0 0 0 / .02))",
    "::before": {
      backgroundColor: "var(--lenso-glass-clear-fill, rgb(255 255 255 / .1))",
      mixBlendMode: "normal",
    },
  },
});
export const materialStyles = stylex.create({
  provider: { display: "contents" },
  root: {
    "--material-blur": "50px",
    "--lenso-material-upper-blend": "normal",
    "--material-lower-blend": "var(--lenso-material-base-lower-blend)",
    position: "relative",
    isolation: "isolate",
    color: "var(--lenso-material-action-label)",
    borderRadius: "inherit",
  },
  layer: {
    position: "absolute",
    inset: 0,
    borderRadius: "inherit",
    pointerEvents: "none",
    zIndex: -1,
  },
  blur: { backdropFilter: "blur(var(--material-blur, 50px))" },
  fallback: {
    display: { default: null, ":is([data-material-paints] > *)": "none" },
  },
  lower: { backgroundColor: "var(--material-lower)", mixBlendMode: "var(--material-lower-blend)" },
  upper: {
    backgroundColor: "var(--material-upper)",
    mixBlendMode: "var(--lenso-material-upper-blend)",
  },
  ultrathin: {
    "--material-upper": "var(--lenso-material-ultrathin-upper)",
    "--material-lower": "var(--lenso-material-ultrathin-lower)",
  },
  thin: {
    "--material-upper": "var(--lenso-material-thin-upper)",
    "--material-lower": "var(--lenso-material-thin-lower)",
  },
  regular: {
    "--material-upper": "var(--lenso-material-regular-upper)",
    "--material-lower": "var(--lenso-material-regular-lower)",
    "--lenso-material-upper-blend": "var(--lenso-material-dense-blend)",
  },
  thick: {
    "--material-upper": "var(--lenso-material-thick-upper)",
    "--material-lower": "var(--lenso-material-thick-lower)",
    "--lenso-material-upper-blend": "var(--lenso-material-dense-blend)",
  },
  chrome: {
    "--material-upper": "var(--lenso-material-chrome-upper)",
    "--material-lower": "var(--lenso-material-chrome-lower)",
    "--lenso-material-upper-blend": "var(--lenso-material-chrome-upper-blend)",
    "--material-lower-blend": "overlay",
    "--material-blur": "var(--lenso-material-chrome-blur)",
  },
  accessible: {
    backgroundColor: {
      default: null,
      ":is([data-material-opaque])": "var(--lenso-material-solid)",
    },
    color: {
      default: "var(--lenso-material-action-label)",
      ":is([data-material-opaque])": "var(--lenso-label-primary)",
    },
    "@media (prefers-reduced-transparency: reduce)": {
      backgroundColor: "var(--lenso-material-solid)",
      color: "var(--lenso-label-primary)",
      "--lg-blur": "0px",
      "--material-blur": "0px",
    },
    "@media (forced-colors: active)": {
      backgroundColor: "Canvas",
      color: "CanvasText",
      outline: "1px solid CanvasText",
    },
  },
  edge: {
    position: "absolute",
    insetInline: 0,
    height: "100%",
    pointerEvents: "none",
    backdropFilter: "blur(3px)",
    backgroundColor: "var(--lenso-material-edge-hard)",
    opacity: "var(--material-edge-visibility, 1)",
    visibility: {
      default: "visible",
      ":is([data-scroll-bound]:not([data-scroll-active]))": "hidden",
    },
  },
  soft: {
    // An opacity group here would isolate child filters from the scroll content.
    opacity: 1,
    backgroundColor: "transparent",
    backdropFilter: "none",
  },
  softLayer: {
    opacity: "var(--material-edge-visibility, 1)",
    ":is([data-contrast='increased'] *)": { display: "none" },
    "@media (prefers-reduced-transparency: reduce)": { display: "none" },
    "@media (forced-colors: active)": { display: "none" },
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
  },
  softTint: {
    backgroundColor: "var(--material-edge-tint, var(--lenso-material-edge-hard))",
    opacity: "calc(var(--material-edge-visibility, 1) * var(--material-edge-tint-opacity, .22))",
  },
  // Bounded masked backdrop filters approximate a spatial blur ramp. Their
  // composited kernels are not a single variable-sigma Gaussian.
  softMask: (mask: string) => ({ maskImage: mask }),
  softProgressive: (blur: number, mask: string) => ({
    backdropFilter: `blur(${blur}px)`,
    maskImage: mask,
  }),
  top: { top: 0, "--material-edge-direction": "to bottom" },
  bottom: { bottom: 0, "--material-edge-direction": "to top" },
  "inline-start": {
    insetBlock: 0,
    insetInlineStart: 0,
    insetInlineEnd: "auto",
    height: "auto",
    "--material-edge-direction": { default: "to right", ":dir(rtl)": "to left" },
  },
  "inline-end": {
    insetBlock: 0,
    insetInlineStart: "auto",
    insetInlineEnd: 0,
    height: "auto",
    "--material-edge-direction": { default: "to left", ":dir(rtl)": "to right" },
  },
  edgeAccessible: {
    ":is([data-contrast='increased'] *)": {
      backgroundColor: "var(--lenso-background-primary)",
      opacity: "var(--material-edge-visibility, 1)",
      backdropFilter: "none",
    },
    "@media (prefers-reduced-transparency: reduce)": {
      backgroundColor: "var(--lenso-background-primary)",
      opacity: "var(--material-edge-visibility, 1)",
      backdropFilter: "none",
    },
    "@media (forced-colors: active)": {
      backgroundColor: "Canvas",
      opacity: "var(--material-edge-visibility, 1)",
      backdropFilter: "none",
    },
  },
});

export const vibrantStyles = stylex.create({
  label: { display: "inline-grid", verticalAlign: "baseline" },
  text: { gridArea: "1 / 1", minWidth: 0 },
  lowerText: {
    "@media (prefers-reduced-transparency: reduce)": {
      color: "var(--material-plain-label)",
      mixBlendMode: "normal",
    },
    "@media (forced-colors: active)": { color: "CanvasText", mixBlendMode: "normal" },
    color: {
      default: "var(--vibrant-label-lower)",
      ":is([data-material-opaque] *)": "var(--material-plain-label)",
    },
    mixBlendMode: {
      default: "var(--lenso-vibrant-label-lower-blend)",
      ":is([data-material-opaque] *)": "normal",
    },
  },
  upperText: {
    display: { default: null, ":is([data-material-opaque] *)": "none" },
    "@media (prefers-reduced-transparency: reduce)": { display: "none" },
    "@media (forced-colors: active)": { display: "none" },
    color: "var(--vibrant-label-upper)",
    mixBlendMode: "luminosity",
    pointerEvents: "none",
    userSelect: "none",
  },
  primary: {
    "--material-plain-label": "var(--lenso-label-primary)",
    "--vibrant-label-lower": "var(--lenso-vibrant-primary)",
    "--lenso-vibrant-label-lower-blend": "var(--lenso-vibrant-primary-blend)",
    "--vibrant-label-upper": "transparent",
  },
  secondary: {
    "--material-plain-label": "var(--lenso-label-secondary)",
    "--vibrant-label-lower": "var(--lenso-vibrant-secondary)",
    "--vibrant-label-upper": "var(--lenso-vibrant-secondary-upper)",
  },
  tertiary: {
    "--material-plain-label": "var(--lenso-label-tertiary)",
    "--vibrant-label-lower": "var(--lenso-vibrant-tertiary)",
    "--vibrant-label-upper": "var(--lenso-vibrant-tertiary-upper)",
  },
  quaternary: {
    "--material-plain-label": "var(--lenso-label-quaternary)",
    "--vibrant-label-lower": "var(--lenso-vibrant-quaternary)",
    "--vibrant-label-upper": "var(--lenso-vibrant-quaternary-upper)",
  },
  fill: {
    "@media (forced-colors: active)": { backgroundColor: "CanvasText", mixBlendMode: "normal" },
    display: "inline-block",
    backgroundColor: "var(--vibrant-fill-color)",
    mixBlendMode: "var(--lenso-vibrant-fill-blend)",
    pointerEvents: "none",
  },
  primaryFill: { "--vibrant-fill-color": "var(--lenso-vibrant-fill-primary)" },
  secondaryFill: { "--vibrant-fill-color": "var(--lenso-vibrant-fill-secondary)" },
  tertiaryFill: { "--vibrant-fill-color": "var(--lenso-vibrant-fill-tertiary)" },
  separator: {
    backgroundColor: "var(--lenso-vibrant-separator)",
    mixBlendMode: "normal",
    display: "block",
    height: 1,
  },
});
