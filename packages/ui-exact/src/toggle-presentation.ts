import {
  glassButtonStyles,
  glassButtonSizes,
  glassButtonVariants,
  glassButtonIconOnlySizes,
} from "@lenso/tokens/glass-button";
import { glassToggleButtonStyles } from "@lenso/tokens/glass-toggle-button";
import { liquidMaterialStyles } from "@lenso/tokens/materials";
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
  if (kind === "glass-toggle-button-icon") return [glassButtonStyles.icon];
  if (kind === "glass-toggle-button" || kind === "glass-toggle-button-group-item") {
    const size = data["lensoSize"],
      variant = data["lensoVariant"];
    if (size !== "sm" && size !== "md" && size !== "lg")
      throw new RangeError(`Unknown GlassToggleButton size: ${size}`);
    if (variant !== "default" && variant !== "prominent")
      throw new RangeError(`Unknown GlassToggleButton variant: ${variant}`);
    const icon = data["lensoIconOnly"] === "true",
      grouped = kind === "glass-toggle-button-group-item";
    return [
      glassButtonStyles.root,
      liquidMaterialStyles.small,
      glassButtonStyles.backdrop,
      glassButtonSizes[size],
      glassButtonVariants[variant],
      glassButtonStyles.interaction,
      toggleButtonStyles.selected,
      glassToggleButtonStyles.selectedMaterial,
      variant === "prominent" && toggleButtonStyles.prominentSelected,
      icon && glassButtonStyles.iconOnly,
      icon && glassButtonIconOnlySizes[size],
      fullWidth && glassButtonStyles.fullWidth,
      grouped && !detached && buttonGroupItemStyles[orientationOf(data)],
      grouped && fullWidth && buttonGroupItemStyles.stretch,
    ];
  }
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
