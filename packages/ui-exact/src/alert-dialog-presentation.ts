import * as stylex from "@stylexjs/stylex";
import { alertDialogStyles as s, alertDialogIconStyles as tones } from "@lenso/tokens/alert-dialog";
import { materialStyles, liquidMaterialStyles } from "@lenso/tokens/materials";
import { buttonStyles, buttonSizes, buttonVariants } from "@lenso/tokens/button";
import { closeButtonStyles } from "@lenso/tokens/close-button";
import { nativeDialogStyles } from "./modal-presentation.js";
import type { StyleInput } from "./style-types.js";

const native = stylex.create({
  root: {
    "::before": { content: "none" },
    transitionDuration: {
      default: "0ms",
      ":is([data-lenso-ready])": {
        default: "0ms",
        "@supports (overlay: auto)": {
          default: "260ms",
          "@media (prefers-reduced-motion: reduce)": "0ms",
        },
      },
    },
  },
  closed: {
    ":is([data-slot='alert-dialog']:not([open]) > [data-slot='alert-dialog-backdrop'], [data-slot='alert-dialog']:not([open]) > [data-slot='alert-dialog-viewport'] > [data-slot='alert-dialog-popup'])":
      { opacity: 0 },
  },
  closedScale: {
    ":is([data-slot='alert-dialog']:not([open]) > [data-slot='alert-dialog-viewport'] > [data-slot='alert-dialog-popup'])":
      { transform: "scale(.96)" },
  },
  lens: {
    ":is([data-material-opaque] > *)": { display: "none" },
    "@media (prefers-reduced-transparency: reduce)": { display: "none" },
    "@media (forced-colors: active)": { display: "none" },
  },
});
const parts = new Map<string, StyleInput>([
  ["alert-dialog", [nativeDialogStyles.root, native.root]],
  ["alert-dialog-viewport", [s.viewport]],
  ["alert-dialog-header", [s.header]],
  ["alert-dialog-title", [s.title]],
  ["alert-dialog-description", [s.description]],
  ["alert-dialog-body", [s.body]],
  ["alert-dialog-fields", [s.fields]],
  ["alert-dialog-close", [s.action]],
  ["alert-dialog-close-icon", [nativeDialogStyles.control, closeButtonStyles.root, s.close]],
  [
    "alert-dialog-lens",
    [materialStyles.layer, liquidMaterialStyles.small, liquidMaterialStyles.medium, native.lens],
  ],
]);
export const alertDialogKinds = [...parts.keys()];
export function alertDialogPresentation(kind: string, data: DOMStringMap): StyleInput | undefined {
  if (kind === "alert-dialog-popup") {
    const size = data["size"];
    if (size !== "xs" && size !== "sm" && size !== "md" && size !== "lg" && size !== "cover")
      throw new RangeError(`Unknown Lenso AlertDialog size: ${size}`);
    if (!["auto", "top", "center", "bottom"].includes(data["placement"] ?? ""))
      throw new RangeError(`Unknown Lenso AlertDialog placement: ${data["placement"]}`);
    return [
      materialStyles.root,
      s.popup,
      s[size],
      materialStyles.accessible,
      native.closed,
      native.closedScale,
    ];
  }
  if (kind === "alert-dialog-backdrop") {
    const variant = data["lensoVariant"];
    if (variant !== "transparent" && variant !== "opaque" && variant !== "blur")
      throw new RangeError(`Unknown Lenso AlertDialog backdrop: ${variant}`);
    return [s.backdrop, s[variant], native.closed];
  }
  if (kind === "alert-dialog-footer") {
    if (!["auto", "side-by-side", "stacked"].includes(data["layout"] ?? ""))
      throw new RangeError(`Unknown Lenso AlertDialog footer: ${data["layout"]}`);
    return [s.footer];
  }
  if (kind === "alert-dialog-icon") {
    const variant = data["lensoVariant"];
    if (
      variant !== "default" &&
      variant !== "accent" &&
      variant !== "success" &&
      variant !== "warning" &&
      variant !== "danger"
    )
      throw new RangeError(`Unknown Lenso AlertDialog icon: ${variant}`);
    return [s.icon, tones[variant]];
  }
  if (kind === "alert-dialog-action") {
    const variant = data["variant"];
    if (variant !== "default" && variant !== "cancel" && variant !== "destructive")
      throw new RangeError(`Unknown Lenso AlertDialog action: ${variant}`);
    return [
      s.action,
      variant === "default" && s.defaultAction,
      variant === "destructive" && s.destructive,
    ];
  }
  if (kind === "alert-dialog-trigger") {
    const size = data["lensoSize"];
    const variant = data["lensoVariant"];
    if (size !== "sm" && size !== "md" && size !== "lg")
      throw new RangeError(`Unknown Lenso AlertDialog trigger size: ${size}`);
    if (variant !== "prominent" && variant !== "bordered" && variant !== "borderless")
      throw new RangeError(`Unknown Lenso AlertDialog trigger variant: ${variant}`);
    return [
      buttonStyles.root,
      buttonStyles.tracking,
      buttonSizes[size],
      buttonVariants[variant],
      s.trigger,
    ];
  }
  return parts.get(kind);
}
