import * as stylex from "@stylexjs/stylex";
import { tooltipStyles as s } from "@lenso/tokens/tooltip";
import { materialStyles as m } from "@lenso/tokens/materials";
import type { StyleInput } from "./style-types.js";

const native = stylex.create({
  contents: { display: "contents" },
  positioner: {
    position: "fixed",
    direction: { default: "ltr", ':is([data-lenso-direction="rtl"])': "rtl" },
    border: 0,
    padding: 0,
    margin: 0,
    backgroundColor: "transparent",
    boxShadow: "none",
    color: "inherit",
    overflow: "visible",
    width: "max-content",
    maxWidth: "calc(100vw - 16px)",
    maxHeight: "calc(100dvh - 16px)",
    inset: "auto",
    positionArea: { default: null, ":is([data-lenso-positioned])": "none" },
    positionTryFallbacks: { default: null, ":is([data-lenso-positioned])": "none" },
    left: "var(--lenso-exact-tooltip-x, auto)",
    top: "var(--lenso-exact-tooltip-y, auto)",
    transitionProperty: "display, overlay",
    transitionBehavior: "allow-discrete",
    transitionDuration: { default: "100ms", "@media (prefers-reduced-motion: reduce)": "0ms" },
  },
  popup: {
    boxSizing: "border-box",
    width: "max-content",
    maxWidth: "min(320px, var(--available-width, calc(100vw - 16px)), 100%)",
    minWidth: 0,
    overflowWrap: "anywhere",
  },
  viewport: {
    maxHeight: "var(--lenso-exact-tooltip-content-height, calc(100dvh - 64px))",
    overflow: "auto",
  },
  material: { "--anchored-material-inset": "12px" },
  arrow: { position: "absolute", pointerEvents: "none" },
  paint: {
    ":is([data-material-opaque] > *)": { display: "none" },
    "@media (prefers-reduced-transparency: reduce)": { display: "none" },
    "@media (forced-colors: active)": { display: "none" },
  },
});

const parts = new Map<string, StyleInput>([
  ["tooltip-root", [native.contents]],
  ["tooltip-provider", [native.contents]],
  ["tooltip-trigger", [s.trigger]],
  ["tooltip-portal", [native.contents]],
  ["tooltip-positioner", [s.positioner, native.positioner]],
  ["tooltip-popup", [m.root, m.thick, s.popup, m.accessible, native.popup]],
  ["tooltip-viewport", [native.viewport]],
  ["tooltip-material", [m.root, m.thick, m.anchored, m.accessible, native.material]],
  ["tooltip-paint-blur", [m.layer, m.fallback, m.blur, m.anchoredPaint, native.paint]],
  ["tooltip-paint-upper", [m.layer, m.fallback, m.upper, m.anchoredPaint, native.paint]],
  ["tooltip-paint-lower", [m.layer, m.fallback, m.lower, m.anchoredPaint, native.paint]],
  ["tooltip-arrow", [s.arrow, native.arrow]],
  ["tooltip-arrow-material", [s.arrowMaterial]],
]);

export const tooltipKinds = [...parts.keys()].filter((kind) => kind !== "tooltip-positioner");
export function tooltipPresentation(kind: string, data: DOMStringMap): StyleInput | undefined {
  if (kind === "tooltip-positioner") {
    if (
      !["top", "bottom", "left", "right", "inline-start", "inline-end"].includes(
        data["lensoSide"] ?? "",
      )
    )
      throw new RangeError(`Unknown Tooltip side: ${data["lensoSide"]}`);
    if (!["start", "center", "end"].includes(data["lensoAlign"] ?? ""))
      throw new RangeError(`Unknown Tooltip alignment: ${data["lensoAlign"]}`);
    if (!["ltr", "rtl"].includes(data["lensoDirection"] ?? ""))
      throw new RangeError(`Unknown Tooltip direction: ${data["lensoDirection"]}`);
  }
  return parts.get(kind);
}
