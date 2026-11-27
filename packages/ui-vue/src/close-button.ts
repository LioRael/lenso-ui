import { closeButtonStyles } from "@lenso/tokens/close-button";
import { defineComponent, h } from "vue";
import { ButtonRoot, type ButtonProps } from "./button.js";
import { CloseButtonIcon, defaultCloseIcon } from "./close-icon.js";
import { type StyleXArgument } from "./parts.js";

export type CloseButtonProps = Omit<ButtonProps, "size" | "variant" | "isIconOnly" | "fullWidth">;
export { CloseButtonIcon };
export const CloseButtonRoot = defineComponent({
  name: "LensoCloseButton",
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () =>
      h(
        ButtonRoot,
        {
          "aria-label": "Close",
          "data-lenso-slot": "close-button",
          ...attrs,
          xstyle: [closeButtonStyles.root, attrs["xstyle"] as StyleXArgument],
        },
        {
          ...slots,
          default: slots["default"] ?? defaultCloseIcon,
        },
      );
  },
}) as unknown as new () => Omit<InstanceType<typeof ButtonRoot>, "$props"> & {
  $props: CloseButtonProps;
};
export const CloseButton: typeof CloseButtonRoot & {
  Root: typeof CloseButtonRoot;
  Icon: typeof CloseButtonIcon;
} = Object.assign(CloseButtonRoot, { Root: CloseButtonRoot, Icon: CloseButtonIcon });
