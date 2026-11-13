"use client";

import { NativeButton as SdkButton } from "../../utils/native-button.js";
import { mergeProps } from "@ui-sdk/react/primitive";
import {
  cloneElement,
  isValidElement,
  useContext,
  type ComponentProps,
  type ReactElement,
} from "react";
import { ButtonGroupContext } from "../button-group/button-group.js";
import { buttonGroupItemStyles } from "@lenso/tokens/button-group";
import {
  glassButtonStyles,
  glassButtonSizes,
  glassButtonVariants,
  glassButtonIconOnlySizes,
} from "@lenso/tokens/glass-button";
import { liquidMaterialStyles } from "@lenso/tokens/materials";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";
import type * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { GlassFusionContext, useElasticRef, useGlassRef } from "@lenso/glass/react";
import { guardLoadingActivation, protectLoadingRender } from "../../utils/action-button.js";

export type GlassButtonSize = "sm" | "md" | "lg";
export type GlassButtonVariant = "default" | "prominent";
// A non-oscillating return avoids repeatedly crossing a proximity threshold.
export const glassButtonRelease = [230, 31] as const;
export const glassButtonFusionTouchRelease = [342, 37] as const;
export type GlassButtonRootProps = StyleXProps<ComponentProps<typeof SdkButton>> & {
  "data-lenso-slot"?: unknown;
  size?: GlassButtonSize;
  variant?: GlassButtonVariant;
  isIconOnly?: boolean;
  icon?: React.ReactNode;
  destructive?: boolean;
  tint?: string;
  fullWidth?: boolean;
  isLoading?: boolean;
  /** Enable pointer-driven enlargement, elastic dragging and spring return. */
  elastic?: boolean;
};
function Icon({
  xstyle,
  style,
  ...props
}: StyleXProps<React.ComponentPropsWithRef<"span">> & { "data-lenso-slot"?: unknown }) {
  const compiled = stylex.props(glassButtonStyles.icon, xstyle);
  return (
    <span
      {...mergeProps(compiled, props)}
      style={mergeStyle(compiled.style, style)}
      data-lenso-slot={props["data-lenso-slot"] ?? "glass-button-icon"}
    />
  );
}

export function GlassButtonRoot({
  disabled: ownDisabled,
  size: ownSize,
  variant: ownVariant,
  fullWidth: ownWidth,
  isIconOnly: ownIconOnly = false,
  icon,
  destructive: ownDestructive,
  tint: ownTint,
  isLoading = false,
  elastic = true,
  xstyle,
  style,
  "data-lenso-slot": dataSlot,
  render,
  onClickCapture,
  onDoubleClickCapture,
  onKeyDownCapture,
  onKeyUpCapture,
  onPointerDownCapture,
  onPointerUpCapture,
  children,
  ref,
  ...props
}: GlassButtonRootProps) {
  const fusion = useContext(GlassFusionContext);
  const group = useContext(ButtonGroupContext);
  const disabled = Boolean(ownDisabled || group.disabled);
  const joined = Boolean(group.orientation && !group.isDetached);
  const destructive = ownDestructive ?? group.destructive ?? false;
  const tint = ownTint ?? group.tint;
  const size = ownSize ?? group.size ?? "lg";
  const variant = ownVariant ?? (group.variant === "prominent" ? "prominent" : "default");
  const isIconOnly = ownIconOnly || (icon != null && children == null);
  const fullWidth = ownWidth ?? group.fullWidth;
  const glassRef = useElasticRef(
    useGlassRef(
      ref,
      !disabled,
      false,
      variant === "prominent" ? `${variant}:${tint ?? ""}:${destructive}` : variant,
    ),
    {
      enabled: elastic && !isLoading && !disabled,
      release: fusion ? glassButtonRelease : undefined,
      touchRelease: fusion ? glassButtonFusionTouchRelease : undefined,
    },
  );
  const protectedRender =
    !isLoading || !render
      ? render
      : typeof render === "function"
        ? (((renderProps, state) =>
            protectLoadingRender(render(renderProps, state))) as typeof render)
        : protectLoadingRender(render);
  const compiled = stylex.props(
    glassButtonStyles.root,
    liquidMaterialStyles.small,
    glassButtonStyles.backdrop,
    glassButtonSizes[size],
    glassButtonVariants[variant],
    glassButtonStyles.interaction,
    isIconOnly && glassButtonStyles.iconOnly,
    isIconOnly && glassButtonIconOnlySizes[size],
    fullWidth && glassButtonStyles.fullWidth,
    isLoading && glassButtonStyles.pending,
    destructive && glassButtonStyles.destructive,
    Boolean(tint) && glassButtonStyles.tint(tint!),
    joined && buttonGroupItemStyles[group.orientation!],
    group.fullWidth && buttonGroupItemStyles.stretch,
    xstyle,
  );
  return (
    <SdkButton
      {...mergeProps(compiled, props)}
      ref={glassRef}
      style={mergeStyle(compiled.style, style)}
      data-lenso-slot={dataSlot ?? "glass-button"}
      data-glass="true"
      data-lenso-group-item={group.orientation ? "" : undefined}
      data-variant={variant}
      data-destructive={destructive ? "" : undefined}
      data-tint={tint ? "" : undefined}
      data-icon={isIconOnly ? "only" : icon != null ? "" : undefined}
      disabled={disabled}
      render={protectedRender}
      aria-busy={isLoading || undefined}
      data-pending={isLoading || undefined}
      onClickCapture={isLoading ? guardLoadingActivation(onClickCapture) : onClickCapture}
      onDoubleClickCapture={
        isLoading ? guardLoadingActivation(onDoubleClickCapture) : onDoubleClickCapture
      }
      onKeyDownCapture={
        isLoading ? guardLoadingActivation(onKeyDownCapture, true) : onKeyDownCapture
      }
      onKeyUpCapture={isLoading ? guardLoadingActivation(onKeyUpCapture, true) : onKeyUpCapture}
      onPointerDownCapture={
        isLoading ? guardLoadingActivation(onPointerDownCapture) : onPointerDownCapture
      }
      onPointerUpCapture={
        isLoading ? guardLoadingActivation(onPointerUpCapture) : onPointerUpCapture
      }
    >
      {(state) => (
        <>
          <span
            aria-hidden="true"
            data-lenso-slot="glass-press-highlight"
            {...stylex.props(liquidMaterialStyles.pressHighlight)}
          />
          {icon != null && <GlassButtonIcon>{icon}</GlassButtonIcon>}
          {typeof children === "function" ? children(state) : children}
        </>
      )}
    </SdkButton>
  );
}
/** Wrap decorative SVGs explicitly; only their viewport size is supplied, never their paths. */
export function GlassButtonIcon({ children, xstyle, ...props }: ComponentProps<typeof Icon>) {
  const icon = isValidElement(children)
    ? cloneElement(children as ReactElement<{ width?: string; height?: string }>, {
        width: "100%",
        height: "100%",
      })
    : children;
  return (
    <Icon aria-hidden="true" {...props} xstyle={xstyle}>
      {icon}
    </Icon>
  );
}
export const GlassButton = Object.assign(GlassButtonRoot, {
  Root: GlassButtonRoot,
  Icon: GlassButtonIcon,
});
