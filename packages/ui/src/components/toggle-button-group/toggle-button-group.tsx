"use client";

import { ToggleGroup as SdkToggleGroup } from "@ui-sdk/react/toggle";
import { createContext, useContext, type ComponentProps } from "react";
import { toggleButtonGroupStyles } from "@lenso/tokens/toggle-button-group";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";
import type * as React from "react";
import * as stylex from "@stylexjs/stylex";
import type { ButtonSize, ButtonVariant } from "../button/button.js";
import type { GlassButtonVariant } from "../glass-button/glass-button.js";
import { GlassContainer } from "../glass-container/glass-container.js";
import { renderElement } from "@ui-sdk/react/primitive";
type GroupOptions = {
  disabled?: boolean;
  size?: ButtonSize;
  variant?: ButtonVariant | GlassButtonVariant | "ghost";
  tint?: string;
  fullWidth?: boolean;
  isDetached?: boolean;
  orientation?: "horizontal" | "vertical";
};
export const ToggleButtonGroupContext = createContext<GroupOptions>({});
function Separator({
  xstyle,
  style,
  ...props
}: StyleXProps<React.ComponentPropsWithRef<"span">> & { "data-lenso-slot"?: unknown }) {
  const compiled = stylex.props(toggleButtonGroupStyles.separator, xstyle);
  return (
    <span
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-lenso-slot={props["data-lenso-slot"] ?? "toggle-button-group-separator"}
    />
  );
}
export type ToggleButtonGroupRootProps = StyleXProps<ComponentProps<typeof SdkToggleGroup>> &
  GroupOptions & { "data-lenso-slot"?: unknown };
export function ToggleButtonGroupRoot({
  children,
  disabled = false,
  size,
  variant,
  tint,
  fullWidth = false,
  isDetached = false,
  orientation = "horizontal",
  xstyle,
  style,
  ...props
}: ToggleButtonGroupRootProps) {
  const options = { size, variant, tint, fullWidth, isDetached, orientation, disabled };
  const compiled = stylex.props(
    toggleButtonGroupStyles.root,
    toggleButtonGroupStyles[orientation],
    fullWidth && toggleButtonGroupStyles.fullWidth,
    isDetached && toggleButtonGroupStyles.detached,
    xstyle,
  );
  return (
    <SdkToggleGroup
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-lenso-slot={props["data-lenso-slot"] ?? "toggle-button-group"}
      render={(partProps, state) => (
        <GlassContainer
          {...partProps}
          render={(containerProps) => renderElement("div", containerProps, props.render, state)}
          disabled={isDetached}
          spacing={18}
          data-lenso-slot={props["data-lenso-slot"] ?? "toggle-button-group"}
          data-lenso-glass-group={isDetached ? undefined : ""}
        />
      )}
      orientation={orientation}
      disabled={disabled}
    >
      {(state) => (
        <ToggleButtonGroupContext value={options}>
          {typeof children === "function" ? children(state) : children}
        </ToggleButtonGroupContext>
      )}
    </SdkToggleGroup>
  );
}
export function ToggleButtonGroupSeparator({ xstyle, ...props }: ComponentProps<typeof Separator>) {
  const { orientation = "horizontal", isDetached } = useContext(ToggleButtonGroupContext);
  return (
    <Separator
      aria-hidden="true"
      {...props}
      xstyle={[
        toggleButtonGroupStyles[
          orientation === "horizontal" ? "separatorHorizontal" : "separatorVertical"
        ],
        isDetached && toggleButtonGroupStyles.hidden,
        xstyle,
      ]}
    />
  );
}
export const ToggleButtonGroup = Object.assign(ToggleButtonGroupRoot, {
  Root: ToggleButtonGroupRoot,
  Separator: ToggleButtonGroupSeparator,
});
