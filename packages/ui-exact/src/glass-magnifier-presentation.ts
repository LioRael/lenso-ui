import { glassStyles as g } from "@lenso/tokens/glass";
import { glassMagnifierStyles as m } from "@lenso/tokens/glass-magnifier";
export function magnifierPresentation(kind: string, data: DOMStringMap) {
  if (kind !== "glass-magnifier") return;
  return [
    g.root,
    g.optics,
    g.foreground,
    g.hotspot,
    data["lensoElastic"] === "true" && g.elastic,
    m.root,
    data["lensoDraggable"] === "true" && m.draggable,
  ];
}
