import {
  glassButtonStyles,
  glassButtonSizes,
  glassButtonVariants,
  glassButtonIconOnlySizes,
} from "@lenso/tokens/glass-button";
import { liquidMaterialStyles } from "@lenso/tokens/materials";
import { Button as SdkButton, type ButtonState } from "@ui-sdk/solid/button";
import { omit, type ComponentProps } from "solid-js";
import { createGlassElement } from "./glass.jsx";
import { htmlPart, sdkPart, type SlotProps, type StyledPart } from "./parts.js";

export type GlassButtonAppearance = {
  size?: keyof typeof glassButtonSizes;
  variant?: keyof typeof glassButtonVariants;
  tint?: string;
  fullWidth?: boolean;
  isIconOnly?: boolean;
};
export type GlassButtonProps = ComponentProps<typeof SdkButton> &
  SlotProps &
  GlassButtonAppearance & {
    elastic?: boolean;
    destructive?: boolean;
  };

const Action: StyledPart<typeof SdkButton, GlassButtonAppearance & { destructive?: boolean }> =
  sdkPart<ComponentProps<typeof SdkButton>, GlassButtonAppearance & { destructive?: boolean }>(
    SdkButton,
    "glass-button",
    (props) => [
      glassButtonStyles.root,
      liquidMaterialStyles.small,
      glassButtonStyles.backdrop,
      glassButtonSizes[props.size ?? "md"],
      glassButtonVariants[props.variant ?? "default"],
      glassButtonStyles.interaction,
      props.isIconOnly && glassButtonStyles.iconOnly,
      props.isIconOnly && glassButtonIconOnlySizes[props.size ?? "md"],
      props.fullWidth && glassButtonStyles.fullWidth,
      props.destructive && glassButtonStyles.destructive,
      props.tint ? glassButtonStyles.tint(props.tint) : false,
    ],
    "size",
    "variant",
    "isIconOnly",
    "fullWidth",
    "destructive",
    "tint",
  );

export const GlassButtonIcon = htmlPart("span", "button-icon", () => glassButtonStyles.icon);
const PressHighlight = htmlPart(
  "span",
  "glass-button-press-highlight",
  () => liquidMaterialStyles.pressHighlight,
);

export function GlassButtonRoot(props: GlassButtonProps) {
  const { ref } = createGlassElement<HTMLButtonElement>({
    profile: "glass-small",
    elastic: () => !props.disabled && props.elastic !== false,
  });
  return (
    <Action
      {...omit(props, "ref", "children", "elastic")}
      ref={[ref, props.ref]}
      data-glass="true"
      data-icon={props.isIconOnly ? "only" : undefined}
    >
      {(state: ButtonState) => {
        const children = props.children;
        return (
          <>
            <PressHighlight aria-hidden="true" />
            {typeof children === "function" ? children(state) : children}
          </>
        );
      }}
    </Action>
  );
}

export const GlassButton = Object.assign(GlassButtonRoot, {
  Root: GlassButtonRoot,
  Icon: GlassButtonIcon,
});
