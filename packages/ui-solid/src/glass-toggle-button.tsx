import {
  glassButtonStyles,
  glassButtonSizes,
  glassButtonVariants,
  glassButtonIconOnlySizes,
} from "@lenso/tokens/glass-button";
import { liquidMaterialStyles } from "@lenso/tokens/materials";
import { toggleButtonStyles } from "@lenso/tokens/toggle-button";
import { Toggle as SdkToggle } from "@ui-sdk/solid/toggle";
import { omit, type ComponentProps } from "solid-js";
import { createGlassElement } from "./glass.jsx";
import { GlassButtonIcon, type GlassButtonAppearance } from "./glass-button.jsx";
import { sdkPart, type SlotProps, type StyledPart } from "./parts.js";

export type GlassToggleButtonProps = ComponentProps<typeof SdkToggle> &
  SlotProps &
  GlassButtonAppearance & {
    elastic?: boolean;
  };

const Toggle: StyledPart<typeof SdkToggle, GlassButtonAppearance> = sdkPart<
  ComponentProps<typeof SdkToggle>,
  GlassButtonAppearance
>(
  SdkToggle,
  "glass-toggle-button",
  (props) => [
    glassButtonStyles.root,
    liquidMaterialStyles.small,
    glassButtonStyles.backdrop,
    glassButtonSizes[props.size ?? "md"],
    glassButtonVariants[props.variant ?? "default"],
    glassButtonStyles.interaction,
    toggleButtonStyles.selected,
    props.variant === "prominent" && toggleButtonStyles.prominentSelected,
    props.isIconOnly && glassButtonStyles.iconOnly,
    props.isIconOnly && glassButtonIconOnlySizes[props.size ?? "md"],
    props.fullWidth && glassButtonStyles.fullWidth,
    props.tint ? glassButtonStyles.tint(props.tint) : false,
  ],
  "size",
  "variant",
  "isIconOnly",
  "fullWidth",
  "tint",
);

export function GlassToggleButtonRoot(props: GlassToggleButtonProps) {
  const { ref } = createGlassElement<HTMLButtonElement>({
    profile: "glass-small",
    elastic: () => !props.disabled && props.elastic !== false,
  });
  return <Toggle {...omit(props, "ref", "elastic")} ref={[ref, props.ref]} data-glass="true" />;
}

export const GlassToggleButton = Object.assign(GlassToggleButtonRoot, {
  Root: GlassToggleButtonRoot,
  Icon: GlassButtonIcon,
});
