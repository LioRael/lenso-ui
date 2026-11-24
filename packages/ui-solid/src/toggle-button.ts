import { toggleButtonStyles } from "@lenso/tokens/toggle-button";
import { buttonStyles, buttonVariants, buttonSizes } from "@lenso/tokens/button";
import { Toggle as SdkRoot, ToggleIcon as SdkIcon } from "@ui-sdk/solid/toggle";
import { type ComponentProps } from "solid-js";
import { sdkPart, type StyledPart } from "./parts.js";

export const ToggleButtonRoot: StyledPart<
  typeof SdkRoot,
  { size?: keyof typeof buttonSizes; variant?: keyof typeof buttonVariants }
> = sdkPart<
  ComponentProps<typeof SdkRoot>,
  { size?: keyof typeof buttonSizes; variant?: keyof typeof buttonVariants }
>(
  SdkRoot,
  "toggle-button",
  (props) => [
    buttonStyles.root,
    buttonStyles.tracking,
    buttonSizes[props.size ?? "md"],
    buttonVariants[props.variant ?? "bordered"],
    toggleButtonStyles.selected,
  ],
  "size",
  "variant",
);
export const ToggleButtonIcon: StyledPart<typeof SdkIcon> = sdkPart(
  SdkIcon,
  "toggle-button-icon",
  () => buttonStyles.icon,
);

export const ToggleButton: typeof ToggleButtonRoot & {
  Root: typeof ToggleButtonRoot;
  Icon: typeof ToggleButtonIcon;
} = Object.assign(ToggleButtonRoot, {
  Root: ToggleButtonRoot,
  Icon: ToggleButtonIcon,
});
