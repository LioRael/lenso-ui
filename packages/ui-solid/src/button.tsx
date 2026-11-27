import { htmlPart } from "./parts.js";
import {
  buttonSizes,
  buttonStyles,
  buttonVariants,
  buttonIconOnlySizes,
} from "@lenso/tokens/button";
import * as stylex from "@stylexjs/stylex";
import { Button as SdkButton, type ButtonState } from "@ui-sdk/solid/button";
import { createMemo, omit, useContext, type ComponentProps } from "solid-js";
import { styled, type StyleXArgument, type StyleXProps } from "./styled.js";

const compile = (styles: StyleXArgument) => stylex.props(styles);

export type ButtonProps = ComponentProps<typeof SdkButton> &
  StyleXProps & {
    size?: "sm" | "md" | "lg";
    variant?: "prominent" | "bordered" | "borderless";
    destructive?: boolean;
    fullWidth?: boolean;
    isIconOnly?: boolean;
    isLoading?: boolean;
    tint?: string;
  };

import { ButtonGroupContext } from "./button-group.jsx";
import { buttonGroupItemStyles } from "@lenso/tokens/button-group";
export function ButtonRoot(props: ButtonProps) {
  const context = useContext(ButtonGroupContext);
  const hasGroup = !!context;
  const group = context ?? {};
  const variant = () =>
    props.variant ?? (group.variant === "default" ? "bordered" : group.variant) ?? "bordered";
  const destructive = () => props.destructive ?? group.destructive;
  const rest = omit(
    props,
    "size",
    "variant",
    "destructive",
    "fullWidth",
    "isIconOnly",
    "isLoading",
    "tint",
    "xstyle",
    "class",
    "style",
  );
  const compiled = createMemo(() => {
    const tint = props.tint ?? group.tint;
    const size = props.size ?? group.size ?? "md";

    return compile([
      buttonStyles.root,
      props.isLoading && buttonStyles.pending,
      buttonSizes[size],
      buttonStyles.tracking,
      buttonVariants[variant()],
      variant() === "bordered" && (destructive() || !!tint) && buttonStyles.tintedBordered,
      destructive() && buttonStyles.destructiveTracking,
      destructive() && size === "lg" && buttonStyles.destructiveLargeTracking,
      variant() === "borderless" && size === "lg" && buttonStyles.largeBorderless,
      props.isIconOnly && buttonStyles.iconOnly,
      props.isIconOnly && buttonIconOnlySizes[size],
      (props.fullWidth ?? group.fullWidth) && buttonStyles.fullWidth,
      hasGroup && !group.isDetached && buttonGroupItemStyles[group.orientation ?? "horizontal"],
      group.fullWidth && buttonGroupItemStyles.stretch,
      destructive() && buttonStyles.destructive,
      tint ? buttonStyles.tint(tint) : false,
      props.xstyle,
    ]);
  });

  return (
    <SdkButton
      data-lenso-slot="button"
      data-glass="false"
      data-variant={variant()}
      data-destructive={destructive() ? "" : undefined}
      data-tint={(props.tint ?? group.tint) ? "" : undefined}
      data-icon={props.isIconOnly ? "only" : undefined}
      {...rest}
      data-lenso-group-item={hasGroup ? "" : undefined}
      disabled={props.disabled || group.disabled || props.isLoading}
      focusableWhenDisabled={
        props.focusableWhenDisabled || (props.isLoading && !props.disabled && !group.disabled)
      }
      aria-busy={props.isLoading ? "true" : props["aria-busy"]}
      data-pending={props.isLoading ? "" : undefined}
      {...styled<ButtonState>(compiled, props)}
    />
  );
}

export const ButtonIcon = htmlPart("span", "button-icon", () => buttonStyles.icon);
export const Button = Object.assign(ButtonRoot, { Root: ButtonRoot, Icon: ButtonIcon });
