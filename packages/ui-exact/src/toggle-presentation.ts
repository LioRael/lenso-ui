import type { StyleInput } from "./style-types.js";
import {
  buttonStyles,
  buttonSizes,
  buttonVariants,
  buttonIconOnlySizes,
} from "@lenso/tokens/button";
import { buttonGroupItemStyles } from "@lenso/tokens/button-group";
import { toggleButtonStyles } from "@lenso/tokens/toggle-button";
import { toggleButtonGroupStyles } from "@lenso/tokens/toggle-button-group";

function orientationOf(data: DOMStringMap) {
  const orientation = data["orientation"];
  if (orientation === "horizontal" || orientation === "vertical") return orientation;
  throw new RangeError(`Unknown Lenso toggle group orientation: ${orientation}`);
}

export function togglePresentation(kind: string, data: DOMStringMap): StyleInput | undefined {
  const fullWidth = data["lensoFullWidth"] === "true";
  const detached = data["lensoDetached"] === "true";
  if (kind === "toggle-button-icon") return [buttonStyles.icon];
  if (kind === "toggle-button-group")
    return [
      toggleButtonGroupStyles.root,
      toggleButtonGroupStyles[orientationOf(data)],
      fullWidth && toggleButtonGroupStyles.fullWidth,
      detached && toggleButtonGroupStyles.detached,
    ];
  if (kind === "toggle-button-group-separator")
    return [
      toggleButtonGroupStyles.separator,
      orientationOf(data) === "horizontal"
        ? toggleButtonGroupStyles.separatorHorizontal
        : toggleButtonGroupStyles.separatorVertical,
      detached && toggleButtonGroupStyles.hidden,
    ];
  if (kind !== "toggle-button" && kind !== "toggle-button-group-item") return;
  const size = data["lensoSize"];
  const requestedVariant = data["lensoVariant"];
  const variant =
    requestedVariant === "default"
      ? "bordered"
      : requestedVariant === "ghost"
        ? "borderless"
        : requestedVariant;
  if (size !== "sm" && size !== "md" && size !== "lg")
    throw new RangeError(`Unknown Lenso ToggleButton size: ${size}`);
  if (variant !== "prominent" && variant !== "bordered" && variant !== "borderless")
    throw new RangeError(`Unknown Lenso ToggleButton variant: ${variant}`);
  const iconOnly = data["lensoIconOnly"] === "true";
  return [
    buttonStyles.root,
    buttonStyles.tracking,
    buttonSizes[size],
    buttonVariants[variant],
    toggleButtonStyles.selected,
    variant === "prominent" && toggleButtonStyles.prominentSelected,
    variant === "borderless" && size === "lg" && buttonStyles.largeBorderless,
    iconOnly && buttonStyles.iconOnly,
    iconOnly && buttonIconOnlySizes[size],
    fullWidth && buttonStyles.fullWidth,
    kind === "toggle-button-group-item" && !detached && buttonGroupItemStyles[orientationOf(data)],
    kind === "toggle-button-group-item" && fullWidth && buttonGroupItemStyles.stretch,
  ];
}
