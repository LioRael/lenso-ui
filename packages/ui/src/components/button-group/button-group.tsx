"use client";

import { createContext, useContext, type ComponentProps } from "react";
import { buttonGroupStyles } from "@lenso/tokens/button-group";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";
import type * as React from "react";
import * as stylex from "@stylexjs/stylex";
import type { ButtonSize, ButtonVariant } from "../button/button.js";
import type { GlassButtonVariant } from "../glass-button/glass-button.js";
import { GlassContainer } from "../glass-container/glass-container.js";
type GroupOptions = {
  disabled?: boolean;
  size?: ButtonSize;
  variant?: ButtonVariant | GlassButtonVariant;
  isDetached?: boolean;
  fullWidth?: boolean;
  destructive?: boolean;
  tint?: string;
  orientation?: "horizontal" | "vertical";
};
export const ButtonGroupContext = createContext<GroupOptions>({});
function Separator({
  xstyle,
  style,
  ...props
}: StyleXProps<React.ComponentPropsWithRef<"span">> & { "data-lenso-slot"?: unknown }) {
  const compiled = stylex.props(buttonGroupStyles.separator, xstyle);
  return (
    <span
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-lenso-slot={props["data-lenso-slot"] ?? "button-group-separator"}
    />
  );
}
export type ButtonGroupRootProps = StyleXProps<React.ComponentPropsWithRef<"fieldset">> &
  GroupOptions & { "data-lenso-slot"?: unknown };
export function ButtonGroupRoot({
  children,
  disabled = false,
  size,
  variant,
  fullWidth = false,
  isDetached = false,
  destructive,
  tint,
  orientation = "horizontal",
  xstyle,
  style,
  ref,
  ...props
}: ButtonGroupRootProps) {
  const options = {
    size,
    variant,
    fullWidth,
    isDetached,
    orientation,
    disabled,
    destructive,
    tint,
  };
  const compiled = stylex.props(
    buttonGroupStyles.root,
    buttonGroupStyles[orientation],
    fullWidth && buttonGroupStyles.fullWidth,
    isDetached && buttonGroupStyles.detached,
    xstyle,
  );
  return (
    <GlassContainer
      render={<fieldset {...props} disabled={disabled} ref={ref} />}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-lenso-slot={props["data-lenso-slot"] ?? "button-group"}
      disabled={isDetached}
      spacing={18}
      data-lenso-glass-group={isDetached ? undefined : ""}
    >
      <ButtonGroupContext value={options}>{children}</ButtonGroupContext>
    </GlassContainer>
  );
}
export function ButtonGroupSeparator({ xstyle, ...props }: ComponentProps<typeof Separator>) {
  const { orientation = "horizontal" } = useContext(ButtonGroupContext);
  return (
    <Separator
      aria-hidden="true"
      {...props}
      xstyle={[
        buttonGroupStyles[
          orientation === "horizontal" ? "separatorHorizontal" : "separatorVertical"
        ],
        xstyle,
      ]}
    />
  );
}
export const ButtonGroup = Object.assign(ButtonGroupRoot, {
  Root: ButtonGroupRoot,
  Separator: ButtonGroupSeparator,
});
