"use client";

import { Children, createContext, isValidElement, useContext, type ComponentProps } from "react";
import { buttonGroupStyles } from "@lenso/tokens/button-group";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";
import type * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { ButtonRoot, type ButtonSize, type ButtonVariant } from "../button/button.js";
type GroupOptions = {
  disabled?: boolean;
  size?: ButtonSize;
  variant?: ButtonVariant;
  fullWidth?: boolean;
  orientation?: "horizontal" | "vertical";
};
export const ButtonGroupContext = createContext<GroupOptions>({});
function Separator({
  xstyle,
  style,
  ...props
}: StyleXProps<React.ComponentPropsWithRef<"span">> & { "data-slot"?: unknown }) {
  const compiled = stylex.props(buttonGroupStyles.separator, xstyle);
  return (
    <span
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-slot={props["data-slot"] ?? "button-group-separator"}
    />
  );
}
export type ButtonGroupRootProps = StyleXProps<React.ComponentPropsWithRef<"fieldset">> &
  GroupOptions & { "data-slot"?: unknown };
export function ButtonGroupRoot({
  children,
  disabled = false,
  size,
  variant,
  fullWidth = false,
  orientation = "horizontal",
  xstyle,
  style,
  ...props
}: ButtonGroupRootProps) {
  const options = { size, variant, fullWidth, orientation, disabled };
  const compiled = stylex.props(
    buttonGroupStyles.root,
    buttonGroupStyles[orientation],
    fullWidth && buttonGroupStyles.fullWidth,
    xstyle,
  );
  return (
    <fieldset
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-slot={props["data-slot"] ?? "button-group"}
      aria-disabled={disabled || undefined}
    >
      {Children.map(children, (child) => (
        <ButtonGroupContext
          value={
            isValidElement(child) &&
            (child.type === ButtonRoot || child.type === ButtonGroupSeparator)
              ? options
              : {}
          }
        >
          {child}
        </ButtonGroupContext>
      ))}
    </fieldset>
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
