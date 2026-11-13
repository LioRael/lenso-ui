"use client";

import { Button as SdkButton } from "@ui-sdk/react/button";
import { mergeProps } from "@ui-sdk/react/primitive";
import {
  cloneElement,
  createContext,
  isValidElement,
  useContext,
  type ComponentProps,
  type ReactElement,
} from "react";
import {
  controlButtonStyles,
  buttonStyles,
  buttonSizes,
  buttonVariants,
  buttonIconOnlySizes,
} from "@lenso/tokens/button";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";
import type * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { ButtonGroupContext } from "../button-group/button-group.js";
import { buttonGroupItemStyles } from "@lenso/tokens/button-group";
import { guardLoadingActivation, protectLoadingRender } from "../../utils/action-button.js";
import { slotRender } from "../../utils/sdk-render.js";

export type ButtonSize = "sm" | "md" | "lg";
export type ButtonVariant = "prominent" | "bordered" | "borderless";
export type ButtonRootProps = StyleXProps<ComponentProps<typeof SdkButton>> & {
  "data-lenso-slot"?: unknown;
  size?: ButtonSize;
  variant?: ButtonVariant;
  isIconOnly?: boolean;
  icon?: React.ReactNode;
  destructive?: boolean;
  tint?: string;
  fullWidth?: boolean;
  isLoading?: boolean;
};
export const LegacyButtonIconContext = createContext(false);
export const ButtonSizeContext = createContext<ButtonSize>("md");
function Icon({
  xstyle,
  style,
  ...props
}: StyleXProps<React.ComponentPropsWithRef<"span">> & { "data-lenso-slot"?: unknown }) {
  const legacy = useContext(LegacyButtonIconContext);
  const size = useContext(ButtonSizeContext);
  const compiled = stylex.props(
    legacy ? controlButtonStyles.icon : buttonStyles.icon,
    legacy && size === "sm" && controlButtonStyles.smallIcon,
    xstyle,
  );
  return (
    <span
      {...mergeProps(compiled, props)}
      style={mergeStyle(compiled.style, style)}
      data-lenso-slot={props["data-lenso-slot"] ?? "button-icon"}
    />
  );
}

export function ButtonRoot({
  disabled: ownDisabled,
  size: ownSize,
  variant: ownVariant,
  fullWidth: ownWidth,
  isIconOnly: ownIconOnly = false,
  icon,
  destructive: ownDestructive,
  tint: ownTint,
  isLoading = false,
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
}: ButtonRootProps) {
  const group = useContext(ButtonGroupContext);
  const destructive = ownDestructive ?? group.destructive ?? false;
  const tint = ownTint ?? group.tint;
  const size = ownSize ?? group.size ?? "md";
  const variant =
    ownVariant ?? (group.variant === "default" ? "bordered" : group.variant) ?? "bordered";
  const isIconOnly = ownIconOnly || (icon != null && children == null);
  const fullWidth = ownWidth ?? group.fullWidth;
  const protectedRender =
    !isLoading || !render
      ? render
      : typeof render === "function"
        ? (((renderProps, state) =>
            protectLoadingRender(render(renderProps, state))) as typeof render)
        : protectLoadingRender(render);
  const compiled = stylex.props(
    buttonStyles.root,
    buttonSizes[size],
    // Native render composition injects a class outside the public props; its owner supplies tracking.
    !("className" in props) && buttonStyles.tracking,
    buttonVariants[variant],
    variant === "bordered" && (destructive || Boolean(tint)) && buttonStyles.tintedBordered,
    !("className" in props) && destructive && buttonStyles.destructiveTracking,
    !("className" in props) &&
      destructive &&
      size === "lg" &&
      buttonStyles.destructiveLargeTracking,
    variant === "borderless" && size === "lg" && buttonStyles.largeBorderless,
    isIconOnly && buttonStyles.iconOnly,
    isIconOnly && buttonIconOnlySizes[size],
    fullWidth && buttonStyles.fullWidth,
    isLoading && buttonStyles.pending,
    destructive && buttonStyles.destructive,
    Boolean(tint) && buttonStyles.tint(tint!),
    group.orientation && !group.isDetached && buttonGroupItemStyles[group.orientation],
    group.fullWidth && buttonGroupItemStyles.stretch,
    xstyle,
  );
  return (
    <ButtonSizeContext value={size}>
      <SdkButton
        {...mergeProps(compiled, props)}
        ref={ref}
        style={mergeStyle(compiled.style, style)}
        data-lenso-slot={dataSlot ?? "button"}
        data-glass="false"
        data-lenso-group-item={group.orientation ? "" : undefined}
        data-variant={variant}
        data-destructive={destructive ? "" : undefined}
        data-tint={tint ? "" : undefined}
        data-icon={isIconOnly ? "only" : icon != null ? "" : undefined}
        disabled={Boolean(ownDisabled || group.disabled)}
        render={slotRender("button", dataSlot ?? "button", protectedRender)}
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
            {icon != null && <ButtonIcon>{icon}</ButtonIcon>}
            {typeof children === "function" ? children(state) : children}
          </>
        )}
      </SdkButton>
    </ButtonSizeContext>
  );
}
/** Wrap decorative SVGs explicitly; only their viewport size is supplied, never their paths. */
export function ButtonIcon({ children, xstyle, ...props }: ComponentProps<typeof Icon>) {
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
export const Button = Object.assign(ButtonRoot, { Root: ButtonRoot, Icon: ButtonIcon });
