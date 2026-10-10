"use client";

import { Toggle as BaseToggle } from "@base-ui/react/toggle";
import { useContext, type ComponentProps } from "react";
import { buttonStyles, buttonSizes, buttonIconOnlySizes } from "@lenso/tokens/button";
import { toggleButtonStyles } from "@lenso/tokens/toggle-button";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";
import * as stylex from "@stylexjs/stylex";
import { ToggleButtonGroupContext } from "../toggle-button-group/toggle-button-group.js";
import { ButtonIcon, ButtonSizeContext, type ButtonSize } from "../button/button.js";
export type ToggleButtonRootProps = StyleXProps<ComponentProps<typeof BaseToggle>> & {
  "data-slot"?: unknown;
  size?: ButtonSize;
  variant?: "default" | "ghost";
  isIconOnly?: boolean;
};
export function ToggleButtonRoot({
  size: ownSize,
  variant: ownVariant,
  isIconOnly = false,
  xstyle,
  style,
  ...props
}: ToggleButtonRootProps) {
  const group = useContext(ToggleButtonGroupContext);
  const size = ownSize ?? group.size ?? "md";
  const variant = ownVariant ?? group.variant ?? "default";
  const compiled = stylex.props(
    buttonStyles.root,
    buttonSizes[size],
    toggleButtonStyles[variant === "ghost" ? "ghost" : "root"],
    isIconOnly && buttonIconOnlySizes[size],
    group.orientation &&
      !group.isDetached &&
      buttonStyles[group.orientation === "horizontal" ? "groupedHorizontal" : "groupedVertical"],
    group.orientation && !group.isDetached && toggleButtonStyles.grouped,
    group.fullWidth && buttonStyles.stretch,
    xstyle,
  );
  return (
    <ButtonSizeContext value={size}>
      <BaseToggle
        {...props}
        {...compiled}
        style={mergeStyle(compiled.style, style)}
        data-slot={props["data-slot"] ?? "toggle-button"}
      />
    </ButtonSizeContext>
  );
}
export const ToggleButton = Object.assign(ToggleButtonRoot, {
  Root: ToggleButtonRoot,
  Icon: ButtonIcon,
});
