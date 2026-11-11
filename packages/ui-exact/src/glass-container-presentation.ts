import * as stylex from "@stylexjs/stylex";
import { glassContainerStyles } from "@lenso/tokens/glass-container";
import { glassStyles } from "@lenso/tokens/glass";
const native = stylex.create({
  pending: { display: { default: null, ":not([data-lenso-ready])": "none" } },
  tint: { "--lenso-glass-container-tint": "var(--lenso-exact-fusion-tint)" },
});
export const glassContainerKinds = [
  "glass-container",
  "glass-container-surface",
  "glass-container-rim",
];
export function glassContainerPresentation(kind: string, data: DOMStringMap) {
  switch (kind) {
    case "glass-container":
      return [glassContainerStyles.root, native.tint];
    case "glass-container-surface":
      return [glassContainerStyles.surface, native.pending];
    case "glass-container-rim":
      return [glassContainerStyles.rim];
    case "glass-container-item":
      return [
        glassStyles.root,
        glassStyles.optics,
        glassStyles.foreground,
        glassStyles.hotspot,
        data["lensoElastic"] === "true" && glassStyles.elastic,
      ];
    default:
      return undefined;
  }
}
