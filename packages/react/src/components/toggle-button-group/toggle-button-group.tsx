"use client";

import { ToggleGroup as BaseToggleGroup } from "@base-ui/react/toggle-group";
import { Children, createContext, isValidElement, useContext, type ComponentProps } from "react";
import { toggleButtonGroupStyles } from "@lenso/tokens/toggle-button-group";
import { styledPart, type StyleXProps } from "../../utils/styled.js";
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
const Root = styledPart(BaseToggleGroup, "toggle-button-group", toggleButtonGroupStyles.root);
const Separator = styledPart(
  "span",
  "toggle-button-group-separator",
  toggleButtonGroupStyles.separator,
);
export type ToggleButtonGroupRootProps = StyleXProps<ComponentProps<typeof BaseToggleGroup>> &
  GroupOptions;
export function ToggleButtonGroupRoot({
  children,
  size,
  variant,
  fullWidth = false,
  isDetached = false,
  orientation = "horizontal",
  xstyle,
  ...props
}: ToggleButtonGroupRootProps) {
  const options = { size, variant, fullWidth, isDetached, orientation };
  return (
    <Root
      {...props}
      orientation={orientation}
      xstyle={[
        toggleButtonGroupStyles[orientation],
        fullWidth && toggleButtonGroupStyles.fullWidth,
        isDetached && toggleButtonGroupStyles.detached,
        xstyle,
      ]}
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
    </Root>
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
