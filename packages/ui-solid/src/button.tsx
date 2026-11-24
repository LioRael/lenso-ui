import {
  buttonSizes,
  buttonStyles,
  buttonVariants,
  buttonIconOnlySizes,
} from "@lenso/tokens/button";
import * as stylex from "@stylexjs/stylex";
import { Button as SdkButton, type ButtonState } from "@ui-sdk/solid/button";
import { createMemo, omit, type ComponentProps } from "solid-js";
import { styled, type StyleXProps } from "./styled.js";

export type ButtonProps = ComponentProps<typeof SdkButton> &
  StyleXProps & {
    size?: "sm" | "md" | "lg";
    variant?: "prominent" | "bordered" | "borderless";
    destructive?: boolean;
    fullWidth?: boolean;
    isIconOnly?: boolean;
    tint?: string;
  };

export function Button(props: ButtonProps) {
  const rest = omit(
    props,
    "size",
    "variant",
    "destructive",
    "fullWidth",
    "isIconOnly",
    "tint",
    "xstyle",
    "class",
    "style",
  );
  const compiled = createMemo(() => {
    const tint = props.tint;
    const size = props.size ?? "md";
    const variant = props.variant ?? "bordered";
    return stylex.props(
      buttonStyles.root,
      buttonSizes[size],
      buttonStyles.tracking,
      buttonVariants[variant],
      variant === "bordered" && (props.destructive || !!props.tint) && buttonStyles.tintedBordered,
      props.destructive && buttonStyles.destructiveTracking,
      props.destructive && size === "lg" && buttonStyles.destructiveLargeTracking,
      variant === "borderless" && size === "lg" && buttonStyles.largeBorderless,
      props.isIconOnly && buttonStyles.iconOnly,
      props.isIconOnly && buttonIconOnlySizes[size],
      props.fullWidth && buttonStyles.fullWidth,
      props.destructive && buttonStyles.destructive,
      tint ? buttonStyles.tint(tint) : false,
      props.xstyle,
    );
  });

  return (
    <SdkButton
      data-lenso-slot="button"
      data-glass="false"
      data-variant={props.variant ?? "bordered"}
      data-destructive={props.destructive ? "" : undefined}
      data-tint={props.tint ? "" : undefined}
      data-icon={props.isIconOnly ? "only" : undefined}
      {...rest}
      {...styled<ButtonState>(compiled, props)}
    />
  );
}
