import * as stylex from "@stylexjs/stylex";
import { navigationBarStyles as n } from "@lenso/tokens/navigation-bar";
import { toolbarStyles as t } from "@lenso/tokens/toolbar";
import { materialStyles as m } from "@lenso/tokens/materials";
import { toolbarPresentation } from "./toolbar-presentation.js";
const native = stylex.create({
  hidden: { display: "none" },
  edge: { "--material-edge-visibility": "0" },
  band: {
    backdropFilter: "blur(var(--lenso-edge-band-blur, 0px))",
    maskImage: "var(--lenso-edge-band-mask, none)",
  },
  tint: { maskImage: "var(--lenso-edge-band-mask, none)" },
});
export const navigationBarKinds = [
  "navigation-bar-leading",
  "navigation-bar-trailing",
  "navigation-bar-large-title",
  "navigation-bar-owner",
];
export function navigationBarPresentation(kind: string, data: DOMStringMap) {
  if (kind === "navigation-bar") {
    if (data["orientation"] !== "horizontal")
      throw new RangeError("NavigationBar requires a horizontal toolbar");
    return [toolbarPresentation("toolbar", data), n.root];
  }
  if (kind === "navigation-bar-owner") return [native.hidden];
  if (kind === "navigation-bar-leading") return [n.side];
  if (kind === "navigation-bar-trailing") return [n.side, n.trailing];
  if (kind === "navigation-bar-title")
    return [n.title, data["lensoLarge"] === "true" && n.collapsingTitle];
  if (kind === "navigation-bar-large-title") return [n.largeTitle];
  if (kind === "navigation-bar-back-icon")
    return [n.backIcon, data["lensoDirection"] === "rtl" && n.backIconRtl];
  if (kind === "navigation-bar-edge") {
    const variant = data["lensoVariant"];
    if (variant !== "uniform" && variant !== "soft")
      throw new RangeError(`Unknown NavigationBar edge: ${variant}`);
    return [
      m.edge,
      variant === "soft" ? m.soft : [m.hard, m.hardTop],
      m.top,
      m.edgeAccessible,
      t.edge,
      variant === "uniform" && t.uniformEdge,
      native.edge,
    ];
  }
  if (kind === "navigation-bar-soft-band")
    return [m.softLayer, data["lensoBand"] === "tint" ? [m.softTint, native.tint] : native.band];
}
