// Copyright (c) 2026 Kelvin Zhang. SPDX-License-Identifier: MIT.
// Modified: native StyleX composition; caller overrides remain last.
import { optical } from "../../optical.stylex.const.js";
import * as stylex from "@stylexjs/stylex";

export const glassStyles = stylex.create({
  elastic: { scale: "var(--lg-press-scale, 1 1)", translate: "var(--lg-press-translate, 0px 0px)" },
  root: {
    "--lg-material": "apple",
    "--apple-material-profile": "small",
    "--lg-blur": "var(--lenso-glass-small-blur, 15.3px)",
    "--lg-saturation": "1",
    position: "relative",
    backgroundColor: "transparent",
  },
  optics: {
    color: { default: null, ":is([data-lenso-glass-opaque])": "var(--lenso-label-primary)" },
    backgroundImage:
      "var(--lenso-fusion-rim, var(--lg-rim, none)), var(--lenso-fusion-preference-paint, var(--lenso-glass-preference-paint, none))",
    backgroundSize: "var(--lenso-fusion-rim-size, 100% 100%)",
    backgroundPosition: "var(--lenso-fusion-rim-position, 0 0)",
    backgroundRepeat: "no-repeat",
    backdropFilter: {
      default:
        "blur(var(--lg-blur, 15.3px)) var(--lenso-fusion-filter, var(--lg-filter, saturate(1))) opacity(calc(var(--lenso-glass-face-opacity, 1) * var(--lenso-fusion-opacity, 1)))",
      ":is([data-copy])": "none",
      ":is([data-lenso-glass-opaque])": "none",
    },
    boxShadow:
      "var(--lenso-fusion-shadow, var(--lg-foreground-shadow, inset 0 0 0 .5px var(--lenso-material-control-edge), 0 1px 3px var(--lenso-material-control-drop)))",
  },
  foreground: {
    "::before": {
      content: '""',
      display: {
        default: "none",
        ":is([data-lenso-glass-foreground-rim]):not([data-lenso-glass-opaque], [data-lenso-glass-fused])":
          "block",
      },
      position: "absolute",
      inset: -1,
      pointerEvents: "none",
      backgroundImage: "var(--lg-foreground-rim, none)",
      backgroundSize: "100% 100%",
      backgroundRepeat: "no-repeat",
    },
  },
  copyLayer: {
    display: { default: null, ":has(+ [data-lenso-glass-fused])": "none" },
    position: "absolute",
    top: 0,
    left: 0,
    margin: 0,
    overflow: "hidden",
    transformOrigin: "0 0",
    pointerEvents: "none",
  },
  // The filtered input stays unpromoted; composite only its unfiltered output shell.
  copyOutput: {
    display: { default: null, ":has(+ [data-lenso-glass-fused])": "none" },
    position: "absolute",
    top: 0,
    left: 0,
    margin: 0,
    transformOrigin: "0 0",
    pointerEvents: "none",
    willChange: "transform",
  },
  copySurface: { width: "100%", height: "100%" },
  copyViewport: { position: "absolute", overflow: "hidden", contain: "paint" },
  copyFrame: { position: "absolute", top: 0, left: 0, transformOrigin: "0 0" },
  hotspot: {
    "::after": {
      display: { default: null, ":is([data-lenso-glass-opaque])": "none" },
      content: '""',
      position: "absolute",
      inset: 0,
      borderRadius: "inherit",
      pointerEvents: "none",
      backgroundImage: optical.pointerHighlight,
      opacity: { default: 0, ":is([data-lenso-pressed], [data-pressed])": 1 },
      transitionProperty: "opacity",
      transitionTimingFunction: "ease-in-out",
      transitionDuration: { default: "220ms", ":is([data-lenso-pressed], [data-pressed])": "0s" },
    },
  },
});
