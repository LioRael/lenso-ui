"use client";

import { Children, createContext, isValidElement, useContext, type ComponentProps } from "react";
import { buttonGroupStyles } from "@lenso/tokens/button-group";
import { styledPart } from "../../utils/styled.js";
import { ButtonRoot, type ButtonSize, type ButtonVariant } from "../button/button.js";
type GroupOptions = {
  disabled?: boolean;
  size?: ButtonSize;
  variant?: ButtonVariant;
  fullWidth?: boolean;
  orientation?: "horizontal" | "vertical";
};
export const ButtonGroupContext = createContext<GroupOptions>({});
const Root = styledPart("fieldset", "button-group", buttonGroupStyles.root);
const Separator = styledPart("span", "button-group-separator", buttonGroupStyles.separator);
export type ButtonGroupRootProps = ComponentProps<typeof Root> & GroupOptions;
export function ButtonGroupRoot({
  children,
  disabled = false,
  size,
  variant,
  fullWidth = false,
  orientation = "horizontal",
  xstyle,
  ...props
}: ButtonGroupRootProps) {
  const options = { size, variant, fullWidth, orientation, disabled };
  return (
    <Root
      {...props}
      aria-disabled={disabled || undefined}
      xstyle={[buttonGroupStyles[orientation], fullWidth && buttonGroupStyles.fullWidth, xstyle]}
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
    </Root>
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
