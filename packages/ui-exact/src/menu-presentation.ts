import { contextMenuStyles } from "@lenso/tokens/context-menu";
import { popupButtonStyles } from "@lenso/tokens/popup-button";
import * as stylex from "@stylexjs/stylex";
import {
  menuStyles as s,
  menuItemStyles as item,
  menuSectionStyles as section,
} from "@lenso/tokens/menu";
import { materialStyles as m, liquidMaterialStyles as liquid } from "@lenso/tokens/materials";
import {
  glassButtonStyles,
  glassButtonSizes,
  glassButtonVariants,
} from "@lenso/tokens/glass-button";
import type { StyleInput } from "./style-types.js";
const native = stylex.create({
  contents: { display: "contents" },
  heading: {
    ':is([data-lenso-resolved-presentation="cascade"] *)': { display: "none" },
  },
  submenuDirection: { ':is([data-lenso-direction="rtl"] *)': { rotate: "180deg" } },
  positioner: {
    position: "fixed",
    pointerEvents: "auto",
    border: 0,
    padding: 0,
    margin: 0,
    backgroundColor: "transparent",
    boxShadow: "none",
    color: "inherit",
    overflow: "visible",
    width: "max-content",
    minWidth: 0,
    maxWidth: "min(var(--available-width, calc(100vw - 16px)), calc(100vw - 16px))",
    maxHeight: "calc(100dvh - 16px)",
    inset: "auto",
    positionArea: { default: null, ":is([data-lenso-positioned])": "none" },
    positionTryFallbacks: { default: null, ":is([data-lenso-positioned])": "none" },
    left: "var(--lenso-exact-menu-x, auto)",
    top: "var(--lenso-exact-menu-y, auto)",
    transitionProperty: "display, overlay",
    transitionBehavior: "allow-discrete",
    transitionDuration: {
      default: "var(--lenso-context-return-duration, 160ms)",
      "@media (prefers-reduced-motion: reduce)": "0ms",
    },
    outline: "none",
  },
  backdrop: {
    position: "fixed",
    inset: 0,
    zIndex: -1,
    userSelect: "none",
    display: {
      default: "none",
      ':is([data-lenso-menu-modal-active] > *, [data-lenso-modal="true"][data-context-preview-retain]:not(:popover-open) > *)':
        "block",
    },
    clipPath: "var(--lenso-exact-menu-backdrop-clip, none)",
  },
  popup: {
    transform: {
      default: "scale(var(--lg-menu-scale, 1))",
      ":is([data-starting-style], [data-ending-style])":
        "scale(calc(var(--lg-menu-scale, 1) * var(--lenso-context-appearance-scale, .96)))",
    },
    width: {
      default: "max-content",
      ':is([data-lenso-context-menu="true"] > *, [data-lenso-context-menu="true"] > [data-slot="context-menu-layout"] > *)': 250,
    },
    display: "block",
    maxWidth: "min(var(--available-width, calc(100vw - 16px)), 100%)",
  },
  content: { maxHeight: "var(--available-height, calc(100dvh - 16px))" },
  lens: {
    opacity: "var(--lg-menu-popup-opacity, 1)",
    transition: "var(--lg-menu-fade-transition, none)",
    ":is([data-material-opaque] > *)": { display: "none" },
    "@media (prefers-reduced-transparency: reduce)": { display: "none" },
    "@media (forced-colors: active)": { display: "none" },
  },
  disabled: {
    ':is([data-lenso-disabled="true"])': { color: "var(--lenso-menu-tertiary)", cursor: "default" },
  },
  secondary: { ':is([data-lenso-disabled="true"] *)': { color: "var(--lenso-menu-quaternary)" } },
  indicator: { ':is([data-lenso-checked="false"])': { opacity: 0 } },
});
const parts = new Map<string, StyleInput>([
  ["menu-root", [native.contents]],
  ["menu-bar-item", [s.barItem]],
  ["menu-expand-trigger", [s.trigger, s.expand]],
  ["menu-bar-lens", [m.layer, liquid.small, liquid.medium, native.lens]],
  ["menu-backdrop", [native.backdrop]],
  ["menu-submenu-root", [native.contents]],
  ["menu-submenu-trigger", [item.root, native.disabled]],
  ["menu-submenu-heading", [item.root, s.submenuHeading, native.heading]],
  ["menu-submenu-body", [s.submenuBody]],
  ["menu-item-submenu-indicator", [item.submenuIndicator, native.submenuDirection]],
  ["menu-portal", [native.contents]],
  ["menu-positioner", [s.positioner, native.positioner]],
  ["menu-popup", [m.root, s.popup, m.accessible, native.popup]],
  ["menu-content", [s.content, native.content]],
  ["menu-surface", [s.surface]],
  ["menu-lens", [m.layer, liquid.small, liquid.medium, native.lens]],
  ["menu-section", [section.root]],
  ["menu-section-label", [section.label]],
  ["menu-radio-group", [section.root]],
  ["menu-item-label", [item.label]],
  ["menu-item-content", [item.content]],
  ["menu-item-description", [item.description, native.secondary]],
  ["menu-item-icon", [item.icon]],
  ["menu-item-shortcut", [item.shortcut, native.secondary]],
  ["menu-item-indicator", [item.indicator, native.indicator]],
  ["menu-separator", [s.separator]],
  ["menu-action-group", [s.actionGroup]],
  ["menu-viewport", []],
]);
export const menuKinds = [...parts.keys()].filter(
  (k) => k !== "menu-positioner" && k !== "menu-bar",
);
export function menuPresentation(kind: string, data: DOMStringMap): StyleInput | undefined {
  if (kind === "menu-popup" && data["lensoMode"] === "compact")
    return [parts.get(kind), contextMenuStyles.compactPopup];
  if (kind === "menu-bar")
    return [m.root, s.bar, data["lensoElastic"] === "true" && s.barElastic, m.accessible];
  if (
    kind === "menu-submenu-trigger" &&
    !["auto", "true", "false"].includes(data["lensoOpenOnHover"] ?? "auto")
  )
    throw new RangeError(`Unknown submenu hover policy: ${data["lensoOpenOnHover"]}`);
  if (kind === "menu-trigger" && data["lensoPresentation"] === "popup-button")
    return [popupButtonStyles.root];
  if (kind === "menu-trigger")
    return [
      glassButtonStyles.root,
      liquid.small,
      glassButtonSizes.md,
      glassButtonVariants.default,
      s.trigger,
      data["lensoIconOnly"] === "true" && s.iconTrigger,
    ];
  if (kind === "menu-item" || kind === "menu-action") {
    if (!["default", "danger"].includes(data["lensoVariant"] ?? ""))
      throw new RangeError(`Unknown Menu item variant: ${data["lensoVariant"]}`);
    return [
      item.root,
      native.disabled,
      data["lensoVariant"] === "danger" && item.danger,
      kind === "menu-action" && s.action,
      data["lensoPresentation"] === "context-bar" && [s.barItem, contextMenuStyles.barItem],
    ];
  }
  if (kind === "menu-positioner") {
    if (
      data["lensoSubmenu"] === "true" &&
      !["auto", "stacked", "cascade"].includes(data["lensoPresentation"] ?? "")
    )
      throw new RangeError(`Unknown submenu presentation: ${data["lensoPresentation"]}`);
    if (
      !["top", "bottom", "left", "right", "inline-start", "inline-end"].includes(
        data["lensoSide"] ?? "",
      )
    )
      throw new RangeError(`Unknown Menu side: ${data["lensoSide"]}`);
    if (!["start", "center", "end"].includes(data["lensoAlign"] ?? ""))
      throw new RangeError(`Unknown Menu alignment: ${data["lensoAlign"]}`);
    if (!["ltr", "rtl"].includes(data["lensoDirection"] ?? ""))
      throw new RangeError(`Unknown Menu direction: ${data["lensoDirection"]}`);
  }
  return parts.get(kind);
}
