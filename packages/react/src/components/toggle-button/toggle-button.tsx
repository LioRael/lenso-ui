"use client";

import { Toggle as BaseToggle } from "@base-ui/react/toggle";
import { useContext, type ComponentProps } from "react";
import { buttonStyles, buttonSizes, buttonIconOnlySizes } from "@lenso/tokens/button";
import { toggleButtonStyles } from "@lenso/tokens/toggle-button";
import { styledPart, type StyleXProps } from "../../utils/styled.js";
import { ToggleButtonGroupContext } from "../toggle-button-group/toggle-button-group.js";
import { ButtonIcon, ButtonSizeContext, type ButtonSize } from "../button/button.js";
const Root = styledPart(BaseToggle, "toggle-button", buttonStyles.root);
export type ToggleButtonRootProps = StyleXProps<ComponentProps<typeof BaseToggle>> & {
  size?: ButtonSize;
  variant?: "default" | "ghost";
  isIconOnly?: boolean;
};
export function ToggleButtonRoot({
  size: ownSize,
  variant: ownVariant,
  isIconOnly = false,
  xstyle,
  ...props
}: ToggleButtonRootProps) {
  const group = useContext(ToggleButtonGroupContext);
  const size = ownSize ?? group.size ?? "md";
  const variant = ownVariant ?? group.variant ?? "default";
  return (
    <ButtonSizeContext value={size}>
      <Root
        {...props}
        xstyle={[
          buttonSizes[size],
          toggleButtonStyles[variant === "ghost" ? "ghost" : "root"],
          toggleButtonStyles.selectedHover,
          isIconOnly && buttonIconOnlySizes[size],
          group.orientation &&
            !group.isDetached &&
            buttonStyles[
              group.orientation === "horizontal" ? "groupedHorizontal" : "groupedVertical"
            ],
          group.orientation && !group.isDetached && toggleButtonStyles.grouped,
          group.fullWidth && buttonStyles.stretch,
          xstyle,
        ]}
      />
    </ButtonSizeContext>
  );
}
export const ToggleButton = Object.assign(ToggleButtonRoot, {
  Root: ToggleButtonRoot,
  Icon: ButtonIcon,
});
