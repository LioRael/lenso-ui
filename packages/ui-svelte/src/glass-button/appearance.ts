import {
  glassButtonIconOnlySizes,
  glassButtonSizes,
  glassButtonStyles,
  glassButtonVariants,
} from "@lenso/tokens/glass-button";
import { liquidMaterialStyles } from "@lenso/tokens/materials";

export type GlassButtonAppearance = {
  size?: keyof typeof glassButtonSizes;
  variant?: keyof typeof glassButtonVariants;
  tint?: string;
  fullWidth?: boolean;
  isIconOnly?: boolean;
};

export function glassButtonAppearance({
  size = "md",
  variant = "default",
  tint,
  fullWidth,
  isIconOnly,
}: GlassButtonAppearance) {
  return [
    glassButtonStyles.root,
    liquidMaterialStyles.small,
    glassButtonStyles.backdrop,
    glassButtonSizes[size],
    glassButtonVariants[variant],
    glassButtonStyles.interaction,
    isIconOnly && glassButtonStyles.iconOnly,
    isIconOnly && glassButtonIconOnlySizes[size],
    fullWidth && glassButtonStyles.fullWidth,
    tint ? glassButtonStyles.tint(tint) : undefined,
  ];
}
