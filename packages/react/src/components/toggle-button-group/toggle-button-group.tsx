"use client";

import { ToggleGroup as BaseToggleGroup } from "@base-ui/react/toggle-group";
import { Children, createContext, isValidElement, useContext, type ComponentProps } from "react";
import { toggleButtonGroupStyles } from "@lenso/tokens/toggle-button-group";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";
import type * as React from "react";
import * as stylex from "@stylexjs/stylex";
import type { ButtonSize } from "../button/button.js";
import { ToggleButtonRoot } from "../toggle-button/toggle-button.js";
type GroupOptions = {
  size?: ButtonSize;
  variant?: "default" | "ghost";
  fullWidth?: boolean;
  isDetached?: boolean;
  orientation?: "horizontal" | "vertical";
};
export const ToggleButtonGroupContext = createContext<GroupOptions>({});
function Separator({
  xstyle,
  style,
  ...props
}: StyleXProps<React.ComponentPropsWithRef<"span">> & { "data-slot"?: unknown }) {
  const compiled = stylex.props(toggleButtonGroupStyles.separator, xstyle);
  return (
    <span
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-slot={props["data-slot"] ?? "toggle-button-group-separator"}
    />
  );
}
export type ToggleButtonGroupRootProps = StyleXProps<ComponentProps<typeof BaseToggleGroup>> &
  GroupOptions & { "data-slot"?: unknown };
export function ToggleButtonGroupRoot({
  children,
  size,
  variant,
  fullWidth = false,
  isDetached = false,
  orientation = "horizontal",
  xstyle,
  style,
  ...props
}: ToggleButtonGroupRootProps) {
  const options = { size, variant, fullWidth, isDetached, orientation };
  const compiled = stylex.props(
    toggleButtonGroupStyles.root,
    toggleButtonGroupStyles[orientation],
    fullWidth && toggleButtonGroupStyles.fullWidth,
    isDetached && toggleButtonGroupStyles.detached,
    xstyle,
  );
  return (
    <BaseToggleGroup
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-slot={props["data-slot"] ?? "toggle-button-group"}
      orientation={orientation}
    >
      {Children.map(children, (child) => (
        <ToggleButtonGroupContext
          value={
            isValidElement(child) &&
            (child.type === ToggleButtonRoot || child.type === ToggleButtonGroupSeparator)
              ? options
              : {}
          }
        >
          {child}
        </ToggleButtonGroupContext>
      ))}
    </BaseToggleGroup>
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
