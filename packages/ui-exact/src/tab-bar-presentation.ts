import { tabBarStyles as s } from "@lenso/tokens/tab-bar";
import { tabsStyles } from "@lenso/tokens/tabs";
import { glassStyles } from "@lenso/tokens/glass";
import { materialStyles } from "@lenso/tokens/materials";
import { tabsPresentation } from "./tabs-presentation.js";
import type { StyleInput } from "./style-types.js";
const parts = new Map<string, StyleInput>([
  ["tab-bar-indicator", [glassStyles.hotspot, s.indicator]],
  ["tab-bar-refraction", [tabsStyles.refraction, s.indicatorRefraction]],
  ["tab-bar-highlight", [s.highlight]],
  ["tab-bar-highlight-clip", [s.highlightClip]],
  ["tab-bar-highlight-optics", [s.highlightOptics]],
  ["tab-bar-highlight-row", [s.highlightRow]],
  ["tab-bar-expand", [s.expand]],
  ["tab-bar-expand-fallback", [s.expandFallback]],
  ["tab-bar-lens", [tabsPresentation("tabs-track-lens", {})]],
]);
export const tabBarKinds = [...parts.keys()];
export function tabBarPresentation(kind: string, data: DOMStringMap): StyleInput | undefined {
  if (
    ![
      "tab-bar",
      "tab-bar-group",
      "tab-bar-list",
      "tab-bar-material",
      "tab-bar-item-container",
      "tab-bar-link",
      "tab-bar-button",
      "tab-bar-icon",
      "tab-bar-label",
      "tab-bar-fallback",
    ].includes(kind)
  )
    return parts.get(kind);
  const layout = data["layout"] ?? "phone",
    phone = layout === "phone",
    separate = data["lensoSeparate"] === "true",
    iconOnly = data["lensoIconOnly"] === "true";
  if (layout !== "phone" && layout !== "tablet")
    throw new RangeError(`Unknown TabBar layout: ${layout}`);
  switch (kind) {
    case "tab-bar":
      return [s.root, phone && s.phoneRoot];
    case "tab-bar-group":
      return [
        s.group,
        phone ? s.phoneGroup : s.tabletGroup,
        separate && s.separate,
        separate && (phone ? s.phoneSeparate : s.tabletSeparate),
        data["lensoElastic"] === "true" && s.elastic,
      ];
    case "tab-bar-list":
      return [s.list, !phone && s.tabletList, !phone && separate && s.tabletSeparateList];
    case "tab-bar-material":
      return [
        materialStyles.root,
        materialStyles.accessible,
        s.material,
        !phone && s.tabletMaterial,
      ];
    case "tab-bar-item-container":
      return [
        s.itemContainer,
        !phone && s.tabletItemContainer,
        separate && s.separateItemContainer,
      ];
    case "tab-bar-link":
    case "tab-bar-button":
      return [
        s.item,
        !phone && s.tabletItem,
        iconOnly && s.iconOnlyItem,
        data["lensoCurrent"] === "true" && s.current,
      ];
    case "tab-bar-icon":
      return [s.icon, !phone && !iconOnly && s.tabletIcon];
    case "tab-bar-label":
      return [s.label, iconOnly && s.visuallyHidden];
    case "tab-bar-fallback":
      return [s.fallback, !phone && s.tabletFallback];
  }
}
