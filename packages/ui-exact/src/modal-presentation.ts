import * as stylex from "@stylexjs/stylex";
import type { StyleInput } from "./style-types.js";
import { modalStyles } from "@lenso/tokens/modal";
import { buttonStyles, buttonSizes, buttonVariants } from "@lenso/tokens/button";
import { closeButtonStyles } from "@lenso/tokens/close-button";

export const nativeDialogStyles = stylex.create({
  root: {
    boxSizing: "border-box",
    position: "fixed",
    inset: 0,
    margin: 0,
    padding: 0,
    border: 0,
    borderRadius: 0,
    boxShadow: "none",
    width: "100%",
    height: "100dvh",
    maxWidth: "none",
    maxHeight: "none",
    backgroundColor: "transparent",
    color: "inherit",
    overflow: "visible",
    pointerEvents: { default: "none", ":is([open])": "auto" },
    outline: "none",
    display: { default: "none", ":is([open])": "block" },
    transitionProperty: "display, overlay",
    transitionBehavior: "allow-discrete",
    transitionDuration: {
      default: "0ms",
      ":is([data-lenso-ready])": {
        default: "0ms",
        "@supports (overlay: auto)": {
          default: "100ms",
          "@media (prefers-reduced-motion: reduce)": "0ms",
        },
      },
    },
    "::backdrop": { backgroundColor: "transparent", backdropFilter: "none" },
  },
  control: { boxSizing: "border-box" },
  closed: {
    ":is([data-slot='modal']:not([open]) > [data-slot='modal-backdrop'], [data-slot='modal']:not([open]) > [data-slot='modal-viewport'] > [data-slot='modal-popup'])":
      { opacity: 0 },
  },
  closedScale: {
    ":is([data-slot='modal']:not([open]) > [data-slot='modal-viewport'] > [data-slot='modal-popup']:not([data-size='full']))":
      {
        transform: "scale(.95)",
      },
  },
});

const parts = new Map<string, StyleInput>([
  ["modal-viewport", [modalStyles.viewport]],
  ["modal-header", [modalStyles.header]],
  ["modal-title", [modalStyles.title]],
  ["modal-description", [modalStyles.description]],
  ["modal-footer", [modalStyles.footer]],
  ["modal-icon", [modalStyles.icon]],
  ["modal-close-icon", [nativeDialogStyles.control, closeButtonStyles.root, modalStyles.close]],
  ["modal-close-glyph", [closeButtonStyles.icon]],
]);

export function modalPresentation(kind: string, data: DOMStringMap): StyleInput | undefined {
  if (kind === "modal") {
    const dismiss = data["lensoDismiss"];
    if (dismiss !== "any" && dismiss !== "closerequest" && dismiss !== "none")
      throw new RangeError(`Unknown Lenso Modal dismissal policy: ${dismiss}`);
    return [nativeDialogStyles.root];
  }
  if (kind === "modal-popup") {
    const size = data["size"];
    const scroll = data["lensoScroll"];
    const placement = data["placement"];
    if (
      size !== "xs" &&
      size !== "sm" &&
      size !== "md" &&
      size !== "lg" &&
      size !== "cover" &&
      size !== "full"
    )
      throw new RangeError(`Unknown Lenso Modal size: ${size}`);
    if (scroll !== "inside" && scroll !== "outside")
      throw new RangeError(`Unknown Lenso Modal scrolling: ${scroll}`);
    if (
      placement !== "auto" &&
      placement !== "top" &&
      placement !== "center" &&
      placement !== "bottom"
    )
      throw new RangeError(`Unknown Lenso Modal placement: ${placement}`);
    return [
      modalStyles.popup,
      modalStyles[size],
      modalStyles[scroll],
      nativeDialogStyles.closed,
      nativeDialogStyles.closedScale,
    ];
  }
  if (kind === "modal-backdrop") {
    const variant = data["lensoVariant"];
    if (variant !== "transparent" && variant !== "opaque" && variant !== "blur")
      throw new RangeError(`Unknown Lenso Modal backdrop: ${variant}`);
    return [modalStyles.backdrop, modalStyles[variant], nativeDialogStyles.closed];
  }
  if (kind === "modal-body") {
    if (data["lensoScroll"] !== "inside" && data["lensoScroll"] !== "outside")
      throw new RangeError(`Unknown Lenso Modal scrolling: ${data["lensoScroll"]}`);
    return [modalStyles.body, data["lensoScroll"] === "outside" && modalStyles.bodyOutside];
  }
  if (kind === "modal-trigger" || kind === "modal-close" || kind === "modal-action") {
    const size = data["lensoSize"];
    const variant = data["lensoVariant"];
    if (size !== "sm" && size !== "md" && size !== "lg")
      throw new RangeError(`Unknown Lenso Modal button size: ${size}`);
    if (variant !== "prominent" && variant !== "bordered" && variant !== "borderless")
      throw new RangeError(`Unknown Lenso Modal button variant: ${variant}`);
    return [
      buttonStyles.root,
      buttonStyles.tracking,
      buttonSizes[size],
      buttonVariants[variant],
      kind === "modal-trigger" && modalStyles.trigger,
    ];
  }
  return parts.get(kind);
}

export const modalKinds = [...parts.keys()];
