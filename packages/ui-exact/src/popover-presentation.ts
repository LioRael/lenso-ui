import * as stylex from "@stylexjs/stylex";
import { popoverStyles as s } from "@lenso/tokens/popover";
import { materialStyles as m } from "@lenso/tokens/materials";
import { buttonStyles, buttonSizes, buttonVariants } from "@lenso/tokens/button";
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
    left: "var(--lenso-exact-popover-x, auto)",
    top: "var(--lenso-exact-popover-y, auto)",
    transitionProperty: "display, overlay",
    transitionBehavior: "allow-discrete",
    transitionDuration: { default: "100ms", "@media (prefers-reduced-motion: reduce)": "0ms" },
  },
  popup: {
    boxSizing: "border-box",
    width: "max-content",
    maxWidth: "min(var(--available-width, calc(100vw - 16px)), 100%)",
    minWidth: 0,
    overflowWrap: "anywhere",
  },
  viewport: {
    maxHeight: "var(--lenso-exact-popover-content-height, calc(100dvh - 64px))",
    overflow: "auto",
  },
  material: { "--anchored-material-inset": "13px" },
  arrow: { position: "absolute", pointerEvents: "none" },
  paint: {
    ":is([data-material-opaque] > *)": { display: "none" },
    "@media (prefers-reduced-transparency: reduce)": { display: "none" },
    "@media (forced-colors: active)": { display: "none" },
  },
});

const parts = new Map<string, StyleInput>([
  ["popover-root", [native.contents]],
  ["popover-portal", [native.contents]],
  ["popover-positioner", [s.positioner, native.positioner]],
  ["popover-popup", [m.root, m.thick, s.popup, m.accessible, native.popup]],
  ["popover-title", [s.title]],
  ["popover-description", [s.description]],
  ["popover-viewport", [native.viewport]],
  ["popover-material", [m.root, m.thick, m.anchored, m.accessible, native.material]],
  ["popover-paint-blur", [m.layer, m.fallback, m.blur, m.anchoredPaint, native.paint]],
  ["popover-paint-upper", [m.layer, m.fallback, m.upper, m.anchoredPaint, native.paint]],
  ["popover-paint-lower", [m.layer, m.fallback, m.lower, m.anchoredPaint, native.paint]],
  ["popover-arrow", [s.arrow, native.arrow]],
  ["popover-arrow-material", [s.arrowMaterial]],
]);

export const popoverKinds = [...parts.keys()].filter((kind) => kind !== "popover-positioner");
export function popoverPresentation(kind: string, data: DOMStringMap): StyleInput | undefined {
  if (kind === "popover-positioner") {
    if (
      !["top", "bottom", "left", "right", "inline-start", "inline-end"].includes(
        data["lensoSide"] ?? "",
      )
    )
      throw new RangeError(`Unknown Popover side: ${data["lensoSide"]}`);
    if (!["start", "center", "end"].includes(data["lensoAlign"] ?? ""))
      throw new RangeError(`Unknown Popover alignment: ${data["lensoAlign"]}`);
    if (!["ltr", "rtl"].includes(data["lensoDirection"] ?? ""))
      throw new RangeError(`Unknown Popover direction: ${data["lensoDirection"]}`);
    return parts.get(kind);
  }
  if (kind === "popover-trigger" || kind === "popover-close") {
    const size = data["lensoSize"],
      variant = data["lensoVariant"];
    if (size !== "sm" && size !== "md" && size !== "lg")
      throw new RangeError(`Unknown Popover button size: ${size}`);
    if (variant !== "prominent" && variant !== "bordered" && variant !== "borderless")
      throw new RangeError(`Unknown Popover button variant: ${variant}`);
    return [
      buttonStyles.root,
      buttonStyles.tracking,
      buttonSizes[size],
      buttonVariants[variant],
      kind === "popover-trigger" && s.trigger,
    ];
  }
  return parts.get(kind);
}
