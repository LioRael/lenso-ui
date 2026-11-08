"use client";

import { Toggle as BaseToggle } from "@base-ui/react/toggle";
import { mergeProps } from "@base-ui/react/merge-props";
import { useContext, type ComponentProps, type ReactNode } from "react";
import {
  glassButtonStyles,
  glassButtonSizes,
  glassButtonVariants,
  glassButtonIconOnlySizes,
} from "@lenso/tokens/glass-button";
import { buttonGroupItemStyles } from "@lenso/tokens/button-group";
import { toggleButtonStyles } from "@lenso/tokens/toggle-button";
import { glassToggleButtonStyles } from "@lenso/tokens/glass-toggle-button";
import { liquidMaterialStyles } from "@lenso/tokens/materials";
import { GlassFusionContext, useElasticRef, useGlassRef } from "@lenso/glass/react";
import * as stylex from "@stylexjs/stylex";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";
import { ToggleButtonGroupContext } from "../toggle-button-group/toggle-button-group.js";
import {
  GlassButtonIcon,
  glassButtonRelease,
  glassButtonFusionTouchRelease,
  type GlassButtonSize,
  type GlassButtonVariant,
} from "../glass-button/glass-button.js";

export type GlassToggleButtonRootProps = StyleXProps<ComponentProps<typeof BaseToggle>> & {
  size?: GlassButtonSize;
  variant?: GlassButtonVariant;
  isIconOnly?: boolean;
  icon?: ReactNode;
  tint?: string;
  fullWidth?: boolean;
  elastic?: boolean;
};

export function GlassToggleButtonRoot({
  ref,
  size: ownSize,
  variant: ownVariant,
  isIconOnly: ownIconOnly = false,
  icon,
  tint: ownTint,
  fullWidth: ownWidth,
  elastic = true,
  disabled: ownDisabled,
  children,
  xstyle,
  style,
  ...props
}: GlassToggleButtonRootProps) {
  const fusion = useContext(GlassFusionContext);
  const group = useContext(ToggleButtonGroupContext);
  const disabled = Boolean(ownDisabled || group.disabled);
  const size = ownSize ?? group.size ?? "lg";
  const variant = ownVariant ?? (group.variant === "prominent" ? "prominent" : "default");
  const tint = ownTint ?? group.tint;
  const joined = Boolean(group.orientation && !group.isDetached);
  const isIconOnly = ownIconOnly || (icon != null && children == null);
  const glassRef = useElasticRef(
    useGlassRef(
      ref,
      !disabled,
      false,
      variant === "prominent" ? `${variant}:${tint ?? ""}:false` : variant,
    ),
    {
      enabled: elastic && !joined && !disabled,
      release: fusion ? glassButtonRelease : undefined,
      touchRelease: fusion ? glassButtonFusionTouchRelease : undefined,
    },
  );
  const compiled = stylex.props(
    glassButtonStyles.root,
    liquidMaterialStyles.small,
    glassButtonStyles.backdrop,
    glassButtonSizes[size],
    glassButtonVariants[variant],
    glassButtonStyles.interaction,
    Boolean(tint) && glassButtonStyles.tint(tint!),
    toggleButtonStyles.selected,
    glassToggleButtonStyles.selectedMaterial,
    variant === "prominent" && toggleButtonStyles.prominentSelected,
    isIconOnly && glassButtonStyles.iconOnly,
    isIconOnly && glassButtonIconOnlySizes[size],
    (ownWidth ?? group.fullWidth) && glassButtonStyles.fullWidth,
    joined && buttonGroupItemStyles[group.orientation!],
    group.fullWidth && buttonGroupItemStyles.stretch,
    xstyle,
  );
  return (
    <BaseToggle
      {...mergeProps(compiled, props)}
      ref={glassRef}
      disabled={disabled}
      style={mergeStyle(compiled.style, style)}
      data-slot={props["data-slot"] ?? "glass-toggle-button"}
      data-glass="true"
      data-variant={variant}
      data-lenso-group-item={group.orientation ? "" : undefined}
    >
      <span
        aria-hidden="true"
        data-slot="glass-press-highlight"
        {...stylex.props(liquidMaterialStyles.pressHighlight)}
      />
      {icon != null && <GlassButtonIcon>{icon}</GlassButtonIcon>}
      {children}
    </BaseToggle>
  );
}

export const GlassToggleButton = Object.assign(GlassToggleButtonRoot, {
  Root: GlassToggleButtonRoot,
  Icon: GlassButtonIcon,
});
