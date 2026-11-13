"use client";

import { Toggle as SdkToggle } from "@ui-sdk/react/toggle";
import { mergeProps } from "@ui-sdk/react/primitive";
import { useContext, type ComponentProps, type ReactNode } from "react";
import {
  buttonStyles,
  buttonSizes,
  buttonVariants,
  buttonIconOnlySizes,
} from "@lenso/tokens/button";
import { buttonGroupItemStyles } from "@lenso/tokens/button-group";
import { toggleButtonStyles } from "@lenso/tokens/toggle-button";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";
import * as stylex from "@stylexjs/stylex";
import { slotRender } from "../../utils/sdk-render.js";
import { ToggleButtonGroupContext } from "../toggle-button-group/toggle-button-group.js";
import {
  ButtonIcon,
  ButtonSizeContext,
  type ButtonSize,
  type ButtonVariant,
} from "../button/button.js";

export type ToggleButtonRootProps = StyleXProps<ComponentProps<typeof SdkToggle>> & {
  size?: ButtonSize;
  variant?: ButtonVariant | "default" | "ghost";
  isIconOnly?: boolean;
  icon?: ReactNode;
  tint?: string;
  fullWidth?: boolean;
};

export function ToggleButtonRoot({
  size: ownSize,
  variant: ownVariant,
  isIconOnly: ownIconOnly = false,
  icon,
  tint: ownTint,
  fullWidth: ownWidth,
  children,
  xstyle,
  style,
  ...props
}: ToggleButtonRootProps) {
  const group = useContext(ToggleButtonGroupContext);
  const size = ownSize ?? group.size ?? "md";
  const requestedVariant = ownVariant ?? group.variant ?? "bordered";
  const variant =
    requestedVariant === "default"
      ? "bordered"
      : requestedVariant === "ghost"
        ? "borderless"
        : requestedVariant;
  const tint = ownTint ?? group.tint;
  const isIconOnly = ownIconOnly || (icon != null && children == null);
  const compiled = stylex.props(
    buttonStyles.root,
    buttonStyles.tracking,
    buttonSizes[size],
    buttonVariants[variant],
    Boolean(tint) && buttonStyles.tint(tint!),
    variant === "bordered" && Boolean(tint) && buttonStyles.tintedBordered,
    toggleButtonStyles.selected,
    variant === "prominent" && toggleButtonStyles.prominentSelected,
    variant === "borderless" && size === "lg" && buttonStyles.largeBorderless,
    isIconOnly && buttonStyles.iconOnly,
    isIconOnly && buttonIconOnlySizes[size],
    (ownWidth ?? group.fullWidth) && buttonStyles.fullWidth,
    group.orientation && !group.isDetached && buttonGroupItemStyles[group.orientation],
    group.fullWidth && buttonGroupItemStyles.stretch,
    xstyle,
  );
  return (
    <ButtonSizeContext value={size}>
      <SdkToggle
        {...mergeProps(compiled, props)}
        style={mergeStyle(compiled.style, style)}
        data-lenso-slot={props["data-lenso-slot"] ?? "toggle-button"}
        render={slotRender(
          "button",
          props["data-lenso-slot"] ?? "toggle-button",
          props.render,
          group.disabled ? { disabled: true } : undefined,
        )}
        data-glass="false"
        data-variant={variant}
        data-lenso-group-item={group.orientation ? "" : undefined}
      >
        {(state) => (
          <>
            {icon != null && <ButtonIcon>{icon}</ButtonIcon>}
            {typeof children === "function" ? children(state) : children}
          </>
        )}
      </SdkToggle>
    </ButtonSizeContext>
  );
}
export const ToggleButton = Object.assign(ToggleButtonRoot, {
  Root: ToggleButtonRoot,
  Icon: ButtonIcon,
});
