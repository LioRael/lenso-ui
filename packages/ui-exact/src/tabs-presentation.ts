import * as stylex from "@stylexjs/stylex";
import { tabsStyles as s } from "@lenso/tokens/tabs";
import { glassStyles } from "@lenso/tokens/glass";
import { materialStyles, liquidMaterialStyles, knobMaterialStyles } from "@lenso/tokens/materials";
import type { StyleInput } from "./style-types.js";
const native = stylex.create({
  list: {
    "--lg-lens-grow-x": "var(--lenso-exact-tabs-grow-x, 27px)",
    "--lg-lens-grow-y": "var(--lenso-exact-tabs-grow-y, 20px)",
  },
  tab: { "--exact-hover-wash": "none", "--exact-hover-dim": "1", backgroundImage: "none" },
  panel: { display: { default: null, ":is([data-lenso-panel-open='false'])": "none" } },
  lens: {
    ":is([data-material-opaque] > *)": { display: "none" },
    "@media (prefers-reduced-transparency: reduce), (forced-colors: active)": { display: "none" },
  },
});
const parts = new Map<string, StyleInput>([
  ["tabs-tint", [s.tint, s.initialIndicator]],
  ["tabs-highlight-clip", [s.highlightClip]],
  ["tabs-highlight-optics", [s.highlightOptics]],
  ["tabs-refraction", [s.refraction]],
  ["tabs-indicator", [s.indicator, glassStyles.hotspot, s.lens, s.initialIndicator]],
  [
    "tabs-knob-lens",
    [knobMaterialStyles.layer, knobMaterialStyles.toggle, knobMaterialStyles.controlEdge],
  ],
  ["tabs-knob-face", [knobMaterialStyles.face]],
  ["tabs-track-lens", [materialStyles.layer, liquidMaterialStyles.small, native.lens]],
]);
export const tabsKinds = [...parts.keys()];
export function tabsPresentation(kind: string, data: DOMStringMap): StyleInput | undefined {
  if (kind === "tabs-glass")
    return [
      data["lensoGlass"] === "true" && materialStyles.root,
      data["lensoGlass"] === "true" && materialStyles.accessible,
      s.glass,
      data["lensoGlass"] !== "true" && s.plain,
    ];
  const vertical = data["orientation"] === "vertical";
  if (kind === "tabs") return [s.root, vertical ? s.vertical : s.horizontal];
  if (kind === "tabs-list-container")
    return [s.listContainer, vertical ? s.verticalContainer : s.overflowContainer];
  if (kind === "tabs-list") {
    const size = data["lensoSize"];
    if (size !== "sm" && size !== "lg") throw new RangeError(`Unknown Tabs size: ${size}`);
    return [
      s.list,
      vertical ? s.listVertical : s.listHorizontal,
      data["lensoGlass"] === "true" && s.glassList,
      data["lensoElastic"] === "true" && s.elastic,
      size === "lg" && s.large,
      native.list,
    ];
  }
  if (kind === "tabs-tab")
    return [
      s.tab,
      s.initialTab,
      vertical && s.tabVertical,
      data["lensoAlign"] === "start" && s.alignStart,
      data["lensoAlign"] === "end" && s.alignEnd,
      native.tab,
    ];
  if (kind === "tabs-panel")
    return [s.panel, vertical ? s.panelVertical : s.panelHorizontal, native.panel];
  if (kind === "tabs-separator")
    return [s.separator, vertical ? s.separatorVertical : s.separatorHorizontal];
  if (kind === "tabs-copy-row") return [s.row, vertical && s.rowVertical];
  return parts.get(kind);
}
