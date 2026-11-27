import {
  buttonIconOnlySizes,
  buttonSizes,
  buttonStyles,
  buttonVariants,
} from "@lenso/tokens/button";
import { buttonGroupItemStyles } from "@lenso/tokens/button-group";
import { Button as SdkButton } from "@ui-sdk/vue/button";
import { defineComponent, h, inject, type PropType } from "vue";
import { ButtonGroupContext, type ButtonSize, type ButtonVariant } from "./button-group.js";
import { htmlPart, partAttributes, type ComponentProps, type StyledPart } from "./parts.js";

type ButtonOptions = {
  size?: ButtonSize;
  variant?: ButtonVariant;
  destructive?: boolean;
  fullWidth?: boolean;
  isIconOnly?: boolean;
  isLoading?: boolean;
  tint?: string;
};

const optionalBoolean = { type: Boolean, default: undefined };
const Root = defineComponent({
  name: "LensoButton",
  inheritAttrs: false,
  props: {
    size: String as PropType<ButtonSize>,
    variant: String as PropType<ButtonVariant>,
    destructive: optionalBoolean,
    fullWidth: optionalBoolean,
    isIconOnly: Boolean,
    isLoading: Boolean,
    tint: String,
    disabled: optionalBoolean,
    focusableWhenDisabled: optionalBoolean,
  },
  setup(props, { attrs, slots }) {
    const group = inject(ButtonGroupContext, undefined);
    return () => {
      const size = props.size ?? group?.size ?? "md";
      const variant =
        props.variant ?? (group?.variant === "default" ? "bordered" : group?.variant) ?? "bordered";
      const destructive = props.destructive ?? group?.destructive;
      const tint = props.tint ?? group?.tint;
      const disabled = props.disabled || group?.disabled;
      return h(
        SdkButton,
        partAttributes(
          "button",
          [
            buttonStyles.root,
            buttonSizes[size],
            buttonStyles.tracking,
            buttonVariants[variant],
            variant === "bordered" && (destructive || !!tint) && buttonStyles.tintedBordered,
            destructive && buttonStyles.destructiveTracking,
            destructive && size === "lg" && buttonStyles.destructiveLargeTracking,
            variant === "borderless" && size === "lg" && buttonStyles.largeBorderless,
            props.isIconOnly && buttonStyles.iconOnly,
            props.isIconOnly && buttonIconOnlySizes[size],
            (props.fullWidth ?? group?.fullWidth) && buttonStyles.fullWidth,
            !!group &&
              !group.isDetached &&
              buttonGroupItemStyles[group.orientation ?? "horizontal"],
            group?.fullWidth && buttonGroupItemStyles.stretch,
            destructive && buttonStyles.destructive,
            (tint && buttonStyles.tint(tint)) || undefined,
            props.isLoading && buttonStyles.pending,
          ],
          {
            "data-glass": "false",
            "data-variant": variant,
            "data-destructive": destructive ? "" : undefined,
            "data-tint": tint ? "" : undefined,
            "data-icon": props.isIconOnly ? "only" : undefined,
            ...attrs,
            "data-lenso-group-item": group ? "" : undefined,
            disabled: disabled || props.isLoading,
            focusableWhenDisabled: props.focusableWhenDisabled || (props.isLoading && !disabled),
            "aria-busy": props.isLoading ? "true" : attrs["aria-busy"],
            "data-pending": props.isLoading ? "" : undefined,
          },
        ),
        slots,
      );
    };
  },
});
export const ButtonRoot = Root as unknown as StyledPart<typeof SdkButton, ButtonOptions>;
export type ButtonProps = ComponentProps<typeof ButtonRoot>;
export const ButtonIcon = htmlPart("span", "button-icon", () => buttonStyles.icon);
export const Button: typeof ButtonRoot & {
  Root: typeof ButtonRoot;
  Icon: typeof ButtonIcon;
} = Object.assign(ButtonRoot, { Root: ButtonRoot, Icon: ButtonIcon });
