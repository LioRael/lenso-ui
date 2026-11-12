import * as stylex from "@stylexjs/stylex";
import { contextMenuStyles as c } from "@lenso/tokens/context-menu";
import { menuPresentation } from "./menu-presentation.js";
import type { StyleInput } from "./style-types.js";
const native = stylex.create({
  root: { display: "contents" },
  backdrop: { zIndex: -1 },
  hidden: { display: "none" },
});
export const contextMenuKinds = [
  "context-menu",
  "context-menu-trigger",
  "context-menu-backdrop",
  "context-menu-bar-owner",
  "context-menu-bar",
  "context-menu-preview",
];
export function contextMenuPresentation(kind: string, data: DOMStringMap): StyleInput | undefined {
  if (kind === "context-menu-preview") return [c.preview];
  if (kind === "context-menu-layout") {
    const layout = data["lensoLayout"],
      align = data["lensoAlignment"];
    if (!["vertical", "horizontal"].includes(layout ?? ""))
      throw new RangeError(`Unknown context layout: ${layout}`);
    if (!["leading", "trailing"].includes(align ?? ""))
      throw new RangeError(`Unknown context preview alignment: ${align}`);
    return [
      c.positioner,
      align === "trailing" && c.trailing,
      layout === "horizontal" && (align === "trailing" ? c.horizontalTrailing : c.horizontal),
    ];
  }
  if (kind === "context-menu-bar-owner") return [native.hidden];
  if (kind === "context-menu-bar") return [c.bar];
  if (kind === "context-menu") return [native.root];
  if (kind === "context-menu-trigger") return [c.trigger];
  if (kind === "context-menu-backdrop")
    return [menuPresentation("menu-backdrop", data), c.backdrop, native.backdrop];
}
